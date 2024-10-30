const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const {
    swapETH, 
    getSwap,
    getSwapHistoryList
} = require('../controller/swap');


// price
router.route('/').get(protect, getSwap);

router.route('/').post(protect,swapETH);

router.route('/getSwapHistoryList').get(protect, getSwapHistoryList);




module.exports = router;