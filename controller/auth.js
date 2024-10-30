const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
require('dotenv').config();

// 일반 로그인
exports.login = function (req, res) {
    // passport 전략 중 local 전략을 사용한다. session 이 아닌 jwt 방식을 사용할 거기 때문에 session 은 false
    passport.authenticate('local', (err, user, msg) => {
        if (err || !user) {
            // 에러가 있거나 유저 객체가 없으면
            return res.status(400).json({
                success: false,
                msg: msg.msg,
                data: user,
            });
        }
        // passport 에서 제공하는 login 함수
        req.login(user, (err) => {
            if (err) {
                console.log('err', err);
                return res.status(400).json({
                    success: false,
                    msg: err,
                    data: user,
                });
            }
            // jwt.sign('token내용', 'JWT secretkey')
            const token = jwt.sign(user, process.env.JWT_SECRET);
            return res.json({ success: true, data: { user, token }, msg: '' });
        });
    })(req, res);
};

exports.checkAccount = async (req, res) => {
    try {
        const { account } = req.body;

        const { cnt } = await db.getUserData(account);

        // 일치하는 주소가 없으면
        if (!cnt) {
            // tb_user 에 insert 시키고
            await db.setUserData({ wallet_addr: account });
        }

        // 있으나 없으나 로그인

        res.status(200).json({
            success: true,
            //data: { galleryList, nft_author: nft_author },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};
