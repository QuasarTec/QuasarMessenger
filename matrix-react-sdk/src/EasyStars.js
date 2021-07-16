import dis from "./dispatcher/dispatcher";
import crypto from 'crypto-js';

async function postData(address, username, password, data = {}) {
    const parsedUsername = '@' + username;

    const body = {
        SECRET_KEY: 'DH3&#!@aidaoi1238^@&%daskl^53h12313^%#%@4112dhasdf12312&^31',
        username: parsedUsername,
        password,
    };

    for (const key in data) {
        body[key] = data[key];
    }

    const rawData = new URLSearchParams(Object.keys(body).map(key=>[key, body[key]]));

    const easyStarsAuth = await fetch(`https://api.quasaria.ru/${address}`, {
        method: 'POST',
        body: rawData.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json',
        },
    });

    const response = await easyStarsAuth.json();
    return response;
}

function getDataFromStorage() {
    const username = localStorage.getItem('username');
    const hash = window.localStorage.getItem('hash');
    const key = window.localStorage.getItem('uuid');

    return {
        username,
        hash,
        key,
    };
}

function decryptPassword() {
    const { hash, key } = getDataFromStorage();

    const bytes = crypto.AES.decrypt(hash, key);
    const decrypted = bytes.toString(crypto.enc.Utf8);

    return decrypted;
}

function logOutEmptyStorage() {
    const { username } = getDataFromStorage();

    if (!username) {
        dis.dispatch({action: 'logout'});
        return true;
    }

    return false;
}

export default { postData, getDataFromStorage, logOutEmptyStorage, decryptPassword };
