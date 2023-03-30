const router = require('express').Router();
const userController = require('../controllers/usersController')
const verifyToken = require("../config/verifyToken");

router.get('/info', verifyToken, userController.info)

router.post('/login', userController.login)

router.post('/register', userController.register)

router.get('/search/:name', verifyToken, userController.searchProfiles)

router.get('/:id', userController.profile)

router.post('/follow', verifyToken, userController.follow)

router.get("/follows/:id", userController.getFollows)

module.exports = router;