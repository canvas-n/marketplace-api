const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const AWS = require('aws-sdk');

const s3Public = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_PUBLIC,
    secretAccessKey: process.env.S3_SECRET_KEY_PUBLIC,
    region: process.env.S3_REGION_PUBLIC,
    img_server_s3: process.env.IMG_SERVER_S3,
});

// 메모리의 파일을 S3에 업로드하고, S3 오브젝트 데이터를 반환합니다.
const uploadFile = async (bucketName, file, s3) => {
    const params = {
        Bucket: bucketName,
        Key: file.originalname, // 고유 키를 생성하는 것을 고려할 수 있습니다.
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data) {
            if (err) {
                console.log("파일 업로드 중 오류: ", err);
                reject(err);
            } else {
                console.log("파일을 성공적으로 업로드했습니다: ", data.Location);
                resolve(data);
            }
        });
    });
}

const makeRandomString = (num) => {
    let temp_pw = '';
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < num; i++) {
        temp_pw += str.charAt(Math.floor(Math.random() * str.length));
    }

    return temp_pw;
};

const makeRandomNumber = (num) => {
    let code = '';
    const str = '0123456789';

    for (let i = 0; i < num; i++) {
        code += str.charAt(Math.floor(Math.random() * str.length));
    }

    return code;
};

const sendSMS = ({ text, phone }) => {
    return client.messages
        .create({
            body: text,
            from: process.env.TWILIO_NUMBER,
            to: phone,
        })
        .then((message) => message.sid);
};

module.exports = {
    makeRandomString,
    sendSMS,
    makeRandomNumber,
    uploadFile,
    s3Public
};
