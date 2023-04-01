const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
require('dotenv').config();
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

const upload = multer({ dest: 'public/profilepicture' });

exports.register = [
  body("username", "Username required")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("password", "Password required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("firstName", "First name required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        throw new Error("Username already exists");
      }

      const user = new User({
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, 10),
        firstName: req.body.firstName,
        lastName: req.body.lastName
      })
      await user.save()
      console.log("User successfully registered")
    } catch (e) {
      console.log(e)
      res.status(401).json({ message: e.message });
    }
  }
]

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username }).select("+password");
    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    if (!isValidPassword) {
      throw new Error("Incorrect password")
    }

    console.log("Correct password")
    const token = jwt.sign({
      userId: user._id,
      userName: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    }, process.env.secret_key, { expiresIn: "1 day" })
    return res.status(200).json({
      message: "Auth Passed",
      userInfo: {
        Id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    })
  } catch (e) {
    console.log("Error", e)
    res.status(401).json({ message: e.message });
  }
}

exports.searchProfiles = async (req, res) => {
  try {
    const profiles = await User.find({
      $or: [
        { firstName: new RegExp(req.params.name, "i") },
        { lastName: new RegExp(req.params.name, "i") }
      ]
    })
    res.json(profiles)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.searchAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ firstName: "1" }).sort({ lastName: "1" })
    res.json(users)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.profile = async (req, res) => {
  try {
    const profile = await User.findOne({ _id: req.params.id })
      .populate('follows').populate('followedBy')
    res.json(profile)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.follow = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.userId })
  const userToFollow = await User.findOne({ _id: req.body.id })

  try {
    if (currentUser.follows.includes(req.body.id)) {
      const currentUserUnfollowed = currentUser.follows.filter(id => id != req.body.id)
      const userToUnfollow = userToFollow.followedBy.filter(id => id != req.user.userId)
      currentUser.follows = currentUserUnfollowed
      userToFollow.followedBy = userToUnfollow
      await currentUser.save()
      await userToFollow.save()
      console.log("Unfollowed")
    } else {
      currentUser.follows.push(req.body.id)
      userToFollow.followedBy.push(currentUser._id)
      await currentUser.save()
      await userToFollow.save()
      console.log("Followed")
    }
    res.json()
  } catch (e) {
    console.log("Error", e)
  }
}

exports.getFollows = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
      .populate("follows")
      .populate("followedBy")
    res.json(user.follows)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.profilePicture = [
  upload.single('image'),

  async (req, res, next) => {
    try {
      const cldRes = await handleUpload(req.file);

      const user = await User.findOneAndUpdate({ _id: req.params.id }, { profilePicture: cldRes.secure_url })
        .populate("follows")
        .populate("followedBy")

      res.json(user)
    } catch (err) {
      console.log(err)
    }
  }
]

exports.info = (req, res) => {
  res.json(req.user)
}