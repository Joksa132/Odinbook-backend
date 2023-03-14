const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
require('dotenv').config();

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

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const isValidPassword = await bcrypt.compare(req.body.password, user.password)

    if (!isValidPassword) {
      throw new Error("Incorrect password")
    }
    console.log("Correct password")
    const token = jwt.sign({
      userId: user._id,
      userName: user.username
    }, process.env.secret_key, { expiresIn: "1 day" })
    return res.status(200).json({
      message: "Auth Passed",
      userInfo: {
        Id: user._id,
        username: user.username
      },
      token
    })
  } catch (e) {
    console.log("Error", e)
  }
}

exports.searchProfiles = async (req, res) => {
  try {
    const profiles = await User.find({
      $or: [
        { firstName: new RegExp(req.params.name, "i") },
        { lastName: new RegExp(req.params.name, "i") }
      ]
      /*
      $or: [
        { firstName: { $in: [req.params.name] } },
        { lastName: { $in: [req.params.name] } }
      ]
      */
    })
    res.json(profiles)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.profile = async (req, res) => {
  try {
    const profile = await User.find({ _id: req.params.id })
    res.json(profile)
  } catch (e) {
    console.log("Error", e)
  }
}

exports.info = (req, res) => {
  res.json(req.user)
}