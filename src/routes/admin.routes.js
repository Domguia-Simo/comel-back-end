const express = require('express')
const router = express.Router()

const {login ,register, getAllUsers, verfiyAdmin, sendCode} = require('../controllers/admin.controller.js')
const isLogin = require('../middleware/isLogin.js')

const verifyAdmin = require('../middleware/verifyAdmin.js')

router.route('/login').post(login)
router.route('/register').post(register)
router.route('/getAllUser').get(isLogin ,getAllUsers)
router.route('/verfiyAdmin').post(verfiyAdmin)
router.route('/sendCode').get(sendCode)

module.exports = router;