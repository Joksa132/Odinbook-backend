const router = require('express').Router();
const postController = require('../controllers/postController')
const verifyToken = require("../config/verifyToken");

router.post("/new", verifyToken, postController.createPost)

router.get("/all", postController.getPosts)

router.get("/:id", postController.profilePosts)

router.post("/like", verifyToken, postController.likePost)

router.get("/likes/:id", postController.getLikes)

module.exports = router;