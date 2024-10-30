const jwt = require('jsonwebtoken');
const db = require('../db.js');
const requestIp = require('request-ip');
const axios = require('axios');
const Web3 = require('web3');
let web3 = {};
require('dotenv').config();

exports.getSwap = async (req, res) => {
    try {


        const { change_rate } = await db.getExchangeData({ symbol: 'CETH' });

        console.log('change_rate', change_rate)

        res.status(200).json({
            success: true,
            data: { change_rate },
            msg: '',
        });

    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.swapETH = async (req, res) => {
    try {
        const user = req.user;
        const { txid, symbol, amount } = req.body;

        console.log('swapETH ============================================= start');
        console.log('swapETH user : ', user);
        console.log('swapETH txid : ', txid);
        console.log('swapETH symbol : ', symbol);
        console.log('swapETH amount : ', amount);
        // amount가 숫자가 아니라면 에러
        if (isNaN(amount)) {
            console.log('swapETH amount is wrong ', amount);
            console.error('swapETH amount is wrong ', amount);
            return res.status(400).json({ success: false, data: null, msg: 'amount is wrong' });
        }
        console.log('swapETH 진행중');

        const result = await db.setSwapInfo({ user_seq: user?.seq, wallet_addr: user?.wallet_addr, txid, symbol, amount });

        res.status(200).json({
            success: true,
            data: result,
            msg: '',
        });

    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};


// 스왑 히스토리 리스트 가져오기
exports.getSwapHistoryList = async (req, res) => {
    try {
        if (req.user) {
            let {
                limit,
                pageParam,
                offset,
            } = req.query;

            const user_seq = req.user.seq;
            console.log('getSwapHistoryList 01 ');

            if (user_seq && user_seq < 1) {
                console.log('user_seq is wrong');
                return res.status(400).json({ success: false, data: null, msg: 'ECT4833' });
            }
            console.log('getSwapHistoryList 02 ');

            const rlist = await db.getSwapHistoryList({
                limit,
                pageParam,
                offset,
                user_seq
            });

            const { cnt } = await db.getSwapHistoryListCnt({
                user_seq
            });

            // ret = escapeOutput(ret);
            console.log(rlist, cnt);

            console.log('getSwapHistoryList end =============================================');
            res.status(200).json({ success: true, data: { rlist, cnt }, msg: '' });
        } else {
            res.status(200).json({ success: false, data: null, msg: '' });
        }
    } catch (e) {
        console.log('error', e);
        console.error('error', e);
        res.status(500).json({ success: false, msg: e.message })
    }
};