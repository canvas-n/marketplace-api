const express = require('express');
const router = express.Router();

const { protect, isLoggedIn } = require('../middlewares/auth');
const {
    getMarketNftList,
    setMarketplaceLike,
    setMarketplaceCancel
} = require("../controller/market");

// --------------------


router.route('/').get(isLoggedIn, getMarketNftList);
router.route("/setMarketplaceLike").post(protect, setMarketplaceLike);
router.route("/setMarketplaceCancel").post(setMarketplaceCancel);


module.exports = router;
