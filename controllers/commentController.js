const Comment = require("../models/Comment");
const { body, validationResult } = require("express-validator");

exports.createComment = [
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const comment = new Comment({
      description: req.body.description,
      createdBy: req.user.userId,
      forPost: req.body.id
    }).save().then(() => {
      console.log("Comment created successfully")
    }).catch(err => {
      return next(err)
    })
    res.json(comment)
  }
]

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ forPost: req.params.id }).sort({
      createdAt: "desc"
    }).populate('createdBy')
      .populate('forPost')
    res.json(comments)
  } catch (e) {
    console.log("Error", e)
  }
}