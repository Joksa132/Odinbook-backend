const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
    select: false
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  follows: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  followedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
});

module.exports = mongoose.model('User', userSchema);