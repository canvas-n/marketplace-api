const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const {
    getPrice
} = require('../controller/price');


// price
router.route('/getPrice').get(getPrice);



module.exports = router;


