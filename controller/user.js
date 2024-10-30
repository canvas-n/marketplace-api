const jwt = require('jsonwebtoken');
const db = require('../db.js');
const requestIp = require('request-ip');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 로그인 한 유저정보
exports.me = async (req, res) => {
    // 비밀번호를 제외한 유저정보를 넘겨준다
    try {
        if (req.user?.cnt > 0) {
            const user = await db.getUserData(req.user?.wallet_addr);
            res.status(200).json({ success: true, data: { user }, msg: '' });
        } else {
            res.status(200).json({ success: false, data: null, msg: '' });
        }
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, msg: e.message });
    }
};

exports.getMyNftList = async (req, res) => {
    // 비밀번호를 제외한 유저정보를 넘겨준다
    try {
        if (req.user?.cnt > 0) {
            const { page, limit, offset } = req.query;
            //const user = await db.getUserData(req.user?.wallet_addr);
            const myNftList = await db.getMyNftsList({user_seq :req.user?.seq, limit, offset})

            console.log('myNftList', myNftList);
            res.status(200).json({
                success: true,
                data: { myNftList },
                msg: '',
            });
        } else {
            res.status(200).json({ success: false, data: null, msg: '' });
        }
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, msg: e.message });
    }
};


// 거래내역 리스트
// - 마켓플레이스에서 거래된 내역
// mtb_market 판매중, 판매 성공
exports.getHistoryList = async (req, res) => {
    try {
        console.log('getHistoryList start =============================================');

        // 유저 로그인 상태 확인
        if (req.user) {
            let {
                limit,
                pageParam,
                offset,
            } = req.query;
            
            const user_seq = req.user.seq;
            console.log('getHistoryList 01 ');

            if (user_seq && user_seq < 1) {
                console.log('user_seq is wrong');
                return res.status(400).json({ success: false, data: null, msg: 'ECT4833' });
            }
            console.log('getHistoryList 02 ');
            
            const rlist = await db.getHistoryList({
                limit,
                pageParam,
                offset,
                user_seq
            });

            const { cnt } = await db.getHistoryListCnt({
                user_seq
            });

            // ret = escapeOutput(ret);
            console.log(rlist, cnt);
            console.log('getHistoryList end =============================================');
            res.status(200).json({success: true, data: {rlist, cnt}, msg: ''});
        } else {
            res.status(200).json({success: false, data: null, msg: ''});
        }
    } catch (e) {
        console.log('error', e);
        console.error('error', e);
        res.status(500).json({success: false, msg: e.message})
    }
}

// 관심 아이템(좋아요) 리스트
// - 관심 아이템 목록
exports.getLikeList = async (req, res) => {
    try {
        console.log('getLikeList start =============================================');

        // 유저 로그인 상태 확인
        if (req.user) {
            let {
                search,    
                category,
                sale,
                priceStart,
                priceEnd,
                sort,
                limit,
                pageParam,
                offset,
            } = req.query;
            
            const user_seq = req.user?.seq;
            console.log('getLikeList 01 ');

            if (user_seq && user_seq < 1) {
                console.log('user_seq is wrong');
                return res.status(400).json({ success: false, data: null, msg: 'ECT4833' });
            }
            console.log('getLikeList 02 ');
            
            const rlist = await db.getLikeList({
                search,    
                category,
                sale,
                priceStart,
                priceEnd,
                sort,
                limit,
                pageParam,
                offset,
                user_seq,
            });

            const { cnt } = await db.getLikeListCnt({
                search,
                category,
                priceStart,
                priceEnd,
                user_seq,
            });

            // ret = escapeOutput(ret);
            console.log(rlist, cnt)
            res.status(200).json({success: true, data: {rlist, cnt}, msg: ''});
        } else {
            res.status(200).json({success: false, data: null, msg: ''});
        }
    } catch (e) {
        console.log('error', e);
        console.error('error', e);
        res.status(500).json({success: false, msg: e.message})
    }
}
