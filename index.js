const fs = require('fs'); // use for logging purposes
const path = require('path');
const crypto = require("crypto");
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

const { HandleUploadRequest, HandleGetRequest } = require('./ImageHandler.js');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 10 MB limit (adjust as needed)
    }
});
const app = express();

const StoragePath = path.join(__dirname, 'Storage');
const SettingsPath = path.join(StoragePath, 'Settings');

var authKeys = require(SettingsPath + '/authKeys.json');

app.use(express.json());

app.get('/ping', function (req, res) {
    res.send('Pong!');
    console.log(crypto.createHash('sha256').update(req.ip + process.env.AUTH_KEY_SALT).digest('hex'));
    console.log(req.ip);
});

app.post('/post', upload.array('files'), async function (req, res) {
    let auth = req.headers['authorization'];
    console.log(req.ip)
    // auth checks
    if (!auth) return res.status(401).send('Not authorized');

    const user = crypto.createHash('sha256').update(req.ip).digest('hex');
    if (authKeys[req.ip] !== auth) return res.status(401).send('Not authorized');
    // request validity checks
    if (!req.files || req.files.length === 0) return res.status(400).send('No files uploaded');

    await HandleUploadRequest(req, user);
    res.status(200).send('Files uploaded successfully');
});

app.get('/get', async function (req, res) {
    let auth = req.headers['authorization'];
    console.log(req.ip);
    // auth checks
    if (!auth) return res.status(401).send('Not authorized');

    const user = crypto.createHash('sha256').update(req.ip).digest('hex');
    if (authKeys[req.ip] !== auth) return res.status(401).send('Not authorized');
    // request validity checks
    if (typeof(req.body.file) != "string") return res.status(400).send('Bad request (no files requested)');

    const file = await HandleGetRequest(req, user);
    res.status(200).send(file);
});

let port = 80;
app.listen(port, function () {
    console.log('Listening on port ' + port);
});