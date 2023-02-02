const express = require("express");
const path = require("path");
const app = express();
const router = require('./router/router');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.json());
const cors = require("cors");
app.use(cors());

app.use(router);
// 기본주소 => http://localhost:3001
// --> http://ip주소:3001 (안드로이드에서는 ip주소만 돌아감)
app.listen(3001, function () {
    console.log("Server Start");
});
