const express = require('express')
const router = express.Router()

const {login ,register} = require('../controllers/admin.controller.js')

router.route('/login').get(login)
router.route('/register').get(register)


module.exports = router;