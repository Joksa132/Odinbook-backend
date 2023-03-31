const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  image: {
    type: String
  }
})

module.exports = mongoose.model('Post', postSchema);