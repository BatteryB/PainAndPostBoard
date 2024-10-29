require('dotenv').config({ path: './env/mail.env' });

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/palette', express.static('palette'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//이메일로 전송하기
app.post('/sendEmail', (req, res) => {
    const { email } = req.body;

    const filePath = path.join(__dirname, 'palette', 'drawing.png'); // 이미지 파일 경로

    // 이미지 파일 읽기
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("이미지 파일 읽기 오류:", err);
            return res.status(500).send('이미지 파일을 읽는 데 오류가 발생했습니다.');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '당신이 그린 그림을 가져왔어요!',
            attachments: [
                {
                    filename: 'drawing.png',
                    content: data,
                    encoding: 'base64'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("이메일 전송 오류:", error);
                return res.status(500).send('이메일 전송 중 오류가 발생했습니다: ' + error.toString());
            }

            res.status(200).send('이메일이 전송되었습니다: ' + info.response);
        });
    });
});

//이미지 저장하기
app.post('/saveImage', (req, res) => {
    const imageData = req.body.image;

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

    const filePath = path.join(__dirname, 'palette', 'drawing.png');

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving image');
        }
    });
});

//이미지 게시하기
let postNum = 1;
app.post('/postImage', (req, res) => {
    const imageData = req.body.image;

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

    const filePath = path.join(__dirname, 'imgPost', `post${postNum}.png`);
    postNum++;

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error posting image');
        } else {
            res.status(200).send('Image posted successfully');
        }
    });
});

//이미지 찾기
app.post('/next-img/:num', (req, res) => {
    let imgNum = parseInt(req.params.num);
    const filePath = path.join(__dirname, `imgPost`, `post${imgNum}.png`);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (imgNum == 1) {
                res.status(200).send({ num: 0 });
                // console.log(0)
            } else {
                res.status(200).send({ num: 1 });
                // console.log(1)
            }
        } else {
            res.status(200).send({ num: imgNum });
            // console.log(imgNum)
        }
    })
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});