const router = require('express').Router();
const postController = require('../controllers/postController')
const verifyToken = require("../config/verifyToken");

router.post("/new", verifyToken, postController.createPost)

router.get("/all", postController.getPosts)

module.exports = router;