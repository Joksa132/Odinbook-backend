const Post = require("../models/Post");
const { body, validationResult } = require("express-validator");

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