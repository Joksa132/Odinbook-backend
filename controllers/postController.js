const Post = require("../models/Post");
const { body, validationResult } = require("express-validator");

exports.createPost = [
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const post = new Post({
      description: req.body.description,
      createdBy: req.user.userId
    }).save().then(() => {
      console.log("Post created successfully")
    }).catch(err => {
      return next(err)
    })
    res.json(post)
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

exports.getLikes = async (req, res) => {
  try {
    const likes = await Post.find({ _id: req.params.id })
      .populate("likes")
    res.json(likes)
  } catch (e) {
    console.log("Error", e)
  }
}