const router = require('express').Router();
const commentController = require('../controllers/commentController')
const verifyToken = require("../config/verifyToken");

router.post("/new", verifyToken, commentController.createComment)

router.get("/:id", commentController.getComments)

router.post("/like", verifyToken, commentController.likeComment)

module.exports = router;