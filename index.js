require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
//const logger = require('morgan');
global.logger || (global.logger = require('./utils/logger')); // → 전역에서 사용
const morganMiddleware = require('./utils/morganMiddleware');

const passport = require('passport');
const passportConfig = require('./passport');
const { v4: uuid } = require('uuid');
const mime = require('mime-types');
const path = require('path');

const storage = multer.diskStorage({
    // (2)
    destination: (req, file, cb) => {
        // (3)
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        // (4)
        cb(null, `${uuid()}.${mime.extension(file.mimetype)}`); // (5)
    },
});

const upload = multer({
    // (6)
    storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype))
            cb(null, true);
        else cb(new Error('해당 파일의 형식을 지원하지 않습니다.'), false);
    },
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
});

const app = express();
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(morganMiddleware); // 로그 출력을 위한 미들웨어 추가

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

passportConfig();

app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:3000', 'https://tnft.canvasn.co.kr'],
        credentials: true,
    })
);
app.use(
    session({
        saveUninitialized: true,
        resave: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

const auth = require('./routes/auth');
const user = require('./routes/user');
const nft = require('./routes/nft');
const price = require('./routes/price');
const swap = require('./routes/swap');
const market = require('./routes/market');

app.post('/api/upload', upload.single('file'), (req, res) => {
    // (7)
    // console.log(req.file);
    res.status(200).json(req.file);
});

app.use('/images', express.static(path.join(__dirname, '/images'))); // (8)

app.use(passport.initialize());
app.use(passport.session());

// 경로
app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);
app.use('/api/v1/nft', nft);
app.use('/api/v1/price', price);
app.use('/api/v1/swap', swap);
app.use('/api/v1/market', market);

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started at http://localhost:${PORT}`));
