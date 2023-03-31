const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
require('dotenv').config();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/profilepicture")
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
  /*body("birthday")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),*/

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const user = new User({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }).save().then(() => {
      console.log("User successfully registered")
    }).catch(err => {
      return next(err)
    })
  }
]

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username }).select("+password");
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
    next(e);
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
      if (req.fileValidationError) (
        console.log(req.fileValidationError)
      )
      const user = await User.findOneAndUpdate({ _id: req.params.id }, { profilePicture: req.file.filename })
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