const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  description: {
    type: String,
    required: true,
    minLength: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  forPost: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  }
})

module.exports = mongoose.model('Comment', commentSchema);