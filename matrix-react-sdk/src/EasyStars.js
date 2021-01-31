async function postData(address, username, password, data = {}){
    const body = {
        SECRET_KEY: 'DH3&#!@aidaoi1238^@&%daskl^53h12313^%#%@4112dhasdf12312&^31',
        username,
        password
    };

    for(let key in data){
        body[key] = data[key];
    }

    const rawData = new URLSearchParams(Object.keys(body).map(key=>[key, body[key]]));

    const easyStarsAuth = await fetch(`https://api.easy-stars.ru/${address}`, {
        method: 'POST',
        body: rawData.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json'
        }
    });

    const response = await easyStarsAuth.json();
    return response
}

export default { postData }