const express = require('express')
const router = express.Router()

const {login ,register, getAllUsers} = require('../controllers/admin.controller.js')
const isLogin = require('../middleware/isLogin.js')

const verifyAdmin = require('../middleware/verifyAdmin.js')

router.route('/login').post(login)
router.route('/register').post(register)
router.route('/getAllUser').get( isLogin ,getAllUsers)

module.exports = router;