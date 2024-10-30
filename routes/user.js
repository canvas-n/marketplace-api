const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
    me, 
    getMyNftList, 
    getHistoryList, 
    getLikeList 
} = require('../controller/user');

// 로그인한 유저 정보 불러오기
router.route('/').get(protect, me);
// my nft 리스트
router.route('/nft').get(protect, getMyNftList);

// 거래내역 리스트
router.route('/getHistoryList').get(protect, getHistoryList);
// 좋아요 리스트
router.route('/getLikeList').get(protect, getLikeList);

module.exports = router;
