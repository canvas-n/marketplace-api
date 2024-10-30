const local = require('./local');
const db = require('../db');
const passport = require('passport');

module.exports = () => {
    passport.serializeUser((req, user, done) => {
        //req.user = user;
        console.log('serial', user);
        done(null, user.wallet_addr);
    });

    passport.deserializeUser(async (req, id, done) => {
        try {
            //const user = await User.findOne({ where: { id }});
            console.log('id', id);
            const user = await db.getUserData(id);
            console.log('user-1', user);
            //req.user = user;
            done(null, user); // req.user
        } catch (error) {
            console.error(error);
            done(error);
        }
    });

    local();
};
