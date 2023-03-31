const router = require('express').Router();
const postController = require('../controllers/postController')
const verifyToken = require("../config/verifyToken");

router.post("/new", verifyToken, postController.createPost)

router.put("/newImage/:id", verifyToken, postController.createPostImage)

router.get("/all", postController.getPosts)

router.get("/follows/all", verifyToken, postController.getFollowerPosts)

router.get("/:id", postController.profilePosts)

router.post("/like", verifyToken, postController.likePost)

router.delete("/delete/:id", verifyToken, postController.deletePost)

router.put("/update/:id", postController.updatePost)

module.exports = router;