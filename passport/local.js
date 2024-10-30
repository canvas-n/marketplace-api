const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db.js');
const passport = require('passport');
require('dotenv').config();

module.exports = () => {
    // Local Strategy
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'address',
                passwordField: 'password', // type을 password로 사용
            },
            async (address, password, done) => {
                console.log('address', address);
                let user = await db.getUserData(address);

                if (user.cnt > 0) {
                    return done(null, user);
                } else {
                    // 회원가입

                    address = address.toLowerCase();
                    let chk = await db.setUserData({
                        wallet_addr: address,
                    });

                    if (chk) {
                        let user = await db.getUserData(address);
                        if (user.cnt > 0) {
                            return done(null, user);
                        }
                    }

                    //return done(null, false, { msg: '확인되지 않습니다.' });
                }
            }
        )
    );

    //JWT Strategy
    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                console.log('jwtPayload', jwtPayload);

                const user = await db.getUserData(jwtPayload.wallet_addr);

                if (!user) {
                    return done(null, false, {
                        msg: '일치하는 유저가 없습니다.',
                    });
                }

                return done(null, user);
            }
        )
    );
};
