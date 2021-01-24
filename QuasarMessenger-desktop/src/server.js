const express = require('express');
var fp = require("find-free-port")
const app = express();

fp(3000, (err, freePort) => {
    app.listen(freePort, () => {
        console.log(`App is listening to the port ${freePort}`);
    });
});


