const router = require('express').Router();
const userController = require('../controllers/usersController')
const verifyToken = require("../config/verifyToken");
const cors = require('cors');

router.get('/info', verifyToken, userController.info)

router.post('/login', userController.login)

router.post('/register', userController.register)

module.exports = router;