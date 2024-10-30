const jwt = require('jsonwebtoken');
const db = require('../db');
// 로그인 해야만 볼 수 있게 막는 미들웨어
exports.protect = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 접근입니다.',
            user: null,
        });
    }

    const token = req.headers.authorization.replace('Bearer', '').trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.getUserData(decoded.wallet_addr);
        // 담아준다
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 접근입니다.',
            user: null,
        });
    }
};

// 둘 다 접근 할 수 있다
exports.isLoggedIn = async (req, res, next) => {

    if (!req.headers.authorization) {
       // 토큰 없으면 그냥 지나가세용
        return next();
    }

    const token = req.headers.authorization.replace("Bearer", "").trim(); // 토큰을 가져온다.

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰을 디코딩한다.
        console.log('decoded', decoded);

        req.user = decoded; // 요청 객체에 유저 정보를 담아준다.
        req.user.type = 'user'
        /*// 패스워드 정보가 빠진 유저 정보를 불러와서
        const user = await db.getUserDataWithoutPW(decoded.seq); // 디코딩된 토큰에서 추출한 seq를 이용해 유저 정보를 가져온다.
        // 담아준다
        req.user = user; // 요청 객체에 유저 정보를 담아준다.*/
        next(); // 다음 미들웨어로 넘어간다.
    } catch (err) {

        /*return res.status(401).json({
            success: false,
            message: "유효하지 않은 접근입니다.",
            user: null,
        }); // 토큰이 유효하지 않을 경우 401 에러를 반환한다.*/
        next();
    }
};
