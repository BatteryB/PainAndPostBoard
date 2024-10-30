require('dotenv').config({ path: './env/mail.env' });

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite = require('sqlite3');

const db = new sqlite.Database('db/paletteDB.db');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use('/palette', express.static('palette'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//이미지 저장하고 메일로 전송하기
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

app.post('/sendEmail', (req, res) => {
    const { email } = req.body;

    const filePath = path.join(__dirname, 'palette', 'drawing.png'); // 이미지 파일 경로

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

// 이미지 게시하기
app.post('/postImage', async (req, res) => {
    const imageData = req.body.image;
    const postName = req.body.postName;

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, 'imgPost', `${postName}.png`);

    await db.run(`insert into post_tbl(postName) values(?)`, [postName]);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error posting image');
        } else {
            res.status(200).send('Image posted successfully');
        }
    });
});


// post
app.post('/getPostImg', async (req, res) => {
    const postList = await new Promise(async (resolve, reject) => {
        db.all(`select * from post_tbl`, (err, row) => resolve(row));
    })
    res.status(200).send(postList)
});

app.post('/addLike', async (req, res) => {
    const postId = req.body.postId;
    await db.run(`update post_tbl set postLike = postLike + 1 where postId = ?`, [postId]);
    res.status(200).send('like successful');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});