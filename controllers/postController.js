const Post = require("../models/Post");
const User = require("../models/User")
const { body, validationResult } = require("express-validator");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true)
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png extensions allowed"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

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
      const post = await Post.findOneAndUpdate({ _id: req.params.id }, { image: req.file.filename }, { new: true })
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