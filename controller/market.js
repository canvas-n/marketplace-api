const jwt = require('jsonwebtoken');
const db = require('../db.js');
const requestIp = require('request-ip');
const bcrypt = require('bcrypt');
const Web3 = require("web3");
const ethers = require("ethers");
require('dotenv').config();

exports.getMarketNftList = async (req, res) => {
    let {
        search,
        category,
        sale,
        priceStart,
        priceEnd,
        sort,
        limit,
        pageParam,
        sell_status,            // <- 추가 해야됨
        user_seq,                // <- 추가 해야됨 (옵션)
        except_mk_seq,          // <- 추가 해야함 (옵션)
    } = req.query;

    try {
        let offset = 0;
        // if (pageParam > 0) {
        //     offset = 12;
        //     offset = offset * pageParam;
        // }
        offset = pageParam;

        var my_user_seq = null;

        if (req.user) {
            my_user_seq = req.user.seq;
            console.log('로그인된 유저');
        }

        // console.log('search : ', search);
        // console.log('category : ', category);
        // console.log('sale : ', sale);
        // console.log('priceStart : ', priceStart);
        // console.log('priceEnd : ', priceEnd);
        // console.log('sort : ', sort);
        // console.log('limit : ', limit);
        // console.log('pageParam : ', pageParam);
        // console.log('sell_status : ', sell_status);

        // console.log('user_seq typeof ', typeof user_seq);
        // if(user_seq == null || user_seq == 'null'){
        //     console.log('user_seq is null');
        // } else {
        //     console.log('user_seq : ', user_seq);
        // }

        // console.log('my_user_seq : ', my_user_seq);

        // if(except_mk_seq === null){
        //     console.log('except_mk_seq is null');
        // } else {
        //     console.log('except_mk_seq : ', my_user_seq);
        // }

        // except_mk_seq = null;
        // user_seq = null;        

        const marketList = await db.getMarketList({
            search,
            sell_status,
            category,
            sale,
            priceStart,
            priceEnd,
            sort,
            limit,
            pageParam,
            offset,
            user_seq,
            my_user_seq,
            except_mk_seq,
        });
        const { cnt } = await db.getMarketCnt({
            search,
            sell_status,
            category,
            priceStart,
            priceEnd,
            user_seq,
            except_mk_seq,
        });

        console.log('===========================================================');
        // console.log('marketList : ', marketList);
        console.log('cnt : ', cnt);
        // console.log(marketList, cnt);
        console.log('===========================================================');

        // sell_status의 종류에 따라서 숫자도 알려줘야 함
        // (N:판매중, C:판매취소, S:판매성공)
        sell_status = 'N';
        const { cnt: cnt_N } = await db.getMarketCnt({
            search,
            sell_status,
            category,
            priceStart,
            priceEnd,
            user_seq,
            except_mk_seq,
        });

        sell_status = 'C';
        const { cnt: cnt_C } = await db.getMarketCnt({
            search,
            sell_status,
            category,
            priceStart,
            priceEnd,
            user_seq,
            except_mk_seq,
        });

        sell_status = 'S';
        const { cnt: cnt_S } = await db.getMarketCnt({
            search,
            sell_status,
            category,
            priceStart,
            priceEnd,
            user_seq,
            except_mk_seq,
        });

        // 인피니티 스크롤 확인
        let last = false;
        if (cnt < pageParam * limit) {
            last = true;
        }

        console.log('cnt_N : ', cnt_N);
        console.log('cnt_C : ', cnt_C);
        console.log('cnt_S : ', cnt_S);

        res.status(200).json({
            success: true,
            data: { marketList, cnt, cnt_N, cnt_C, cnt_S },
            msg: '',
        });

        // 테스트 코드 ------------------------------------------------------------ 시작
        // {
        //     console.log('getHistoryList -------------------------------------------- start')
        //     // user_seq = 14;          // 나
        //     user_seq = 4;           // 선영
        //     const rlist = await db.getHistoryList({
        //         limit,
        //         pageParam,
        //         offset,
        //         user_seq
        //     });

        //     const { cnt: tcnt } = await db.getHistoryListCnt({
        //         user_seq
        //     });

        //     console.log(rlist, tcnt)
        //     console.log('getHistoryList -------------------------------------------- end')
        // }

        // {
        //     console.log('getLikeList -------------------------------------------- start')
        //     user_seq = 14;
        //     const rlist = await db.getLikeList({
        //         search,    
        //         category,
        //         sale,
        //         priceStart,
        //         priceEnd,
        //         sort,
        //         limit,
        //         pageParam,
        //         offset,
        //         user_seq,
        //     });

        //     const { cnt: tcnt } = await db.getLikeListCnt({
        //         search,
        //         category,
        //         priceStart,
        //         priceEnd,
        //         user_seq,
        //     });

        //     // ret = escapeOutput(ret);
        //     console.log(rlist, tcnt)
        //     console.log('getLikeList -------------------------------------------- end')
        // }
        // 테스트 코드 ------------------------------------------------------------ 끝
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

// 마켓플레이스 좋아요
exports.setMarketplaceLike = async (req, res) => {
    try {
        console.log('setMarketplaceLike start =============================================');

        // 유저 로그인 상태 확인
        if (req.user) {
            const { mk_seq } = req.body;
            const user_seq = req.user.seq;
            console.log('setMarketplaceLike 01 ');

            if (user_seq && user_seq < 1) {
                console.log('user_seq is wrong');
                return res.status(400).json({ success: false, data: null, msg: 'ECT4833' });
            }

            if (!mk_seq || mk_seq < 1) {
                return res.status(400).json({ success: false, data: null, msg: 'mk_seq is wrong' });
            }

            console.log('setMarketplaceLike 02 ');

            let ret = await db.setMarketplaceLike(user_seq, mk_seq);
            // ret = escapeOutput(ret);
            res.status(200).json({ success: true, data: { ret }, msg: '' });
        } else {
            res.status(200).json({ success: false, data: null, msg: '' });
        }
    } catch (e) {
        console.log('error', e);
        console.error('error', e);
        res.status(500).json({ success: false, msg: e.message })
    }
}

// 마켓플레이스에 올라온 NFT 취소 요청(nft의 owner의 변경으로 인해서 프론트가 체크후에 취소 요청)
exports.setMarketplaceCancel = async (req, res) => {
    try {
        console.log('setMarketplaceCancel start =============================================');
        const { mk_seq } = req.body;
        if (!mk_seq || mk_seq < 1) {
            return res.status(400).json({ success: false, data: null, msg: 'mk_seq is wrong' });
        }

        console.log('setMarketplaceCancel mk_seq : ', mk_seq);
        let ret = await db.setMarketplaceCancel({ mk_seq });
        // ret = escapeOutput(ret);
        res.status(200).json({ success: true, data: { ret }, msg: '' });

    } catch (e) {
        console.log('error', e);
        console.error('error', e);
        res.status(500).json({ success: false, msg: e.message })
    }
}