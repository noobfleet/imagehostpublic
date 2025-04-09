const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const StoragePath = path.join(__dirname, 'Storage');
const SettingsPath = path.join(StoragePath, 'Settings');
const UserContentsPath = path.join(StoragePath, 'UserContent');

var userToHash = require(path.join(SettingsPath, 'userToHash.json'));

async function HandleUploadRequest(req, user) {
    if(!userToHash[req.ip]) {
        userToHash[req.ip] = user;
        fs.writeFile(path.join(SettingsPath, 'userToHash.json'), JSON.stringify(userToHash), 'ascii', () => {});
    }

    const userPath = path.join(UserContentsPath, user);
    if (!fs.existsSync(userPath)) fs.mkdirSync(userPath, { recursive: true });

    for(let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imgLocation = path.join(userPath, file.originalname);
        await fs.writeFileSync(imgLocation, file.buffer);
    }
}

async function HandleGetRequest(req, user) {
    if(!userToHash[req.ip]) {
        userToHash[req.ip] = user;
        fs.writeFile(path.join(SettingsPath, 'userToHash.json'), JSON.stringify(userToHash), 'ascii', () => {});
    }

    const userPath = path.join(UserContentsPath, user);
    if (!fs.existsSync(userPath)) fs.mkdirSync(userPath, { recursive: true });

    const imgLocation = path.join(userPath, req.body.file);
    if (!fs.existsSync(imgLocation)) return null;

    return fs.readFileSync(imgLocation);
}

module.exports = {
    HandleUploadRequest,
    HandleGetRequest
}