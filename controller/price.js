const jwt = require('jsonwebtoken');
const db = require('../db.js');
const requestIp = require('request-ip');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.getPrice = async (req, res) => {
    try {
        const price = await db.getPrice();

        res.status(200).json({
            success: true,
            data: { price },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};