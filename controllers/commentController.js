const Comment = require("../models/Comment");
const { body, validationResult } = require("express-validator");

exports.createComment = [
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
      const comment = new Comment({
        description: req.body.description,
        createdBy: req.user.userId,
        forPost: req.body.id
      })
      await comment.save()
      res.json(comment)
    } catch (err) {
      next(err)
    }
  }
]

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ forPost: req.params.id }).sort({
      createdAt: "desc"
    }).populate('createdBy')
      .populate('forPost')
      .populate('likes')
    res.json(comments)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.likeComment = async (req, res) => {
  const comment = await Comment.findOne({ _id: req.body.commentId })
  const isLiked = comment.likes.includes(req.user.userId)

  try {
    if (!isLiked) {
      comment.likes.push(req.user.userId)
      await comment.save()
      console.log("liked")
    } else {
      const likesFiltered = comment.likes.filter(id => id != req.user.userId)
      comment.likes = likesFiltered
      await comment.save()
      console.log("unliked")
    }

    res.json();
  } catch (err) {
    console.log(err);
    res.json();
  }
}