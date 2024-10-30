const express = require('express');
const router = express.Router();
const {
    login,
} = require('../controller/auth');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
require('dotenv').config();

// 로그인
router.route('/login').post(login);


module.exports = router;