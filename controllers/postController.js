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
    }).populate('createdBy')
    res.json(posts)
  } catch (e) {
    console.log("Error", e)
  }
}