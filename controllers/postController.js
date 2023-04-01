const Post = require("../models/Post");
const User = require("../models/User")
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
  });
  return res;
}

const upload = multer({ dest: 'public/images' });

exports.createPost = [
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
      const post = new Post({
        description: req.body.description,
        createdBy: req.user.userId
      })
      await post.save()
      const populatedPost = await post.populate("createdBy");
      console.log("Post created successfully")
      res.json(populatedPost)
    } catch (err) {
      return next(err)
    }
  }
]

exports.createPostImage = [
  upload.single('image'),

  async (req, res, next) => {
    try {
      const cldRes = await handleUpload(req.file);

      const post = await Post.findOneAndUpdate({ _id: req.params.id }, { image: cldRes.secure_url }, { new: true })
        .populate('createdBy')
        .populate('likes')
        .populate('createdAt')

      res.json(post)
    } catch (err) {
      return next(err)
    }
  }
]

exports.updatePost = [
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
      const post = await Post.findOneAndUpdate({ _id: req.params.id }, { description: req.body.description }, { new: true })
        .populate('createdBy')
        .populate('createdAt')
        .populate('likes')
      res.json(post)
    } catch (err) {
      return next(err)
    }
  }
]

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({
      createdAt: "desc"
    }).populate('createdBy').populate('likes')
    res.json(posts)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.getFollowerPosts = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId })
    const following = user.follows.map(follow => follow._id)
    following.push(user._id)

    const posts = await Post.find({ createdBy: { $in: following } })
      .sort({ createdAt: "desc" })
      .populate('createdBy')
      .populate('likes')
    res.json(posts)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.profilePosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.id }).sort({
      createdAt: "desc"
    }).populate("createdBy")
    res.json(posts)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.likePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.body.postId })
  const isLiked = post.likes.includes(req.user.userId)

  try {
    if (!isLiked) {
      post.likes.push(req.user.userId)
      await post.save()
      console.log("liked")
    } else {
      const likesFiltered = post.likes.filter(id => id != req.user.userId)
      post.likes = likesFiltered
      await post.save()
      console.log("unliked")
    }

    res.json();
  } catch (err) {
    console.log(err);
    res.json();
  }
}

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id })
    console.log("Deleted post")
    res.json(post)
  } catch (e) {
    console.log(e)
  }
}