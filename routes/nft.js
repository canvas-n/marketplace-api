const express = require('express');
const router = express.Router();

const { protect, isLoggedIn } = require('../middlewares/auth');
const {
    getHeaderGallery,
    getHomeGallery,
    getHomeTopLank,
    getHomeAuction,
    getHomeNewNft,
    getNftDetail,

    getGalleyList,
    sellNft,
    getRecommendNftList, buyNft, cancelSellNft,
} = require('../controller/nft');

// Home
router.route('/getHomeGallery').get(getHomeGallery);
router.route('/getHomeTopLank').get(getHomeTopLank);
router.route('/getHomeAuction').get(getHomeAuction);
router.route('/getHomeNewNft').get(getHomeNewNft);
router.route('/getHeaderGallery').get(getHeaderGallery);

// nft detail
router.route('/normal/detail/:id').get(isLoggedIn, getNftDetail);

router.route('/normal/getGalley').get(getGalleyList);

// --------------------
router.route('/sell').post(protect, sellNft);
router.route('/recomm').get(getRecommendNftList);
router.route('/detail').get(isLoggedIn, getNftDetail);

router.route('/buy').post(protect, buyNft);
router.route('/cancel').post(protect, cancelSellNft);

module.exports = router;
