// express 실행 설정
const express = require("express");
// router기능 사용설정
const router = express.Router();
const path = require("path");
const mysql = require("mysql2"); // 설치한 mysql기능

let conn = mysql.createConnection({
  // mysql 정보
  host: "project-db-stu.ddns.net",
  user: "groove",
  password: "haksee",
  port: "3307",
  database: "groove", // mysql에서 생성했던 database이름
});

// let conn = mysql.createConnection({
//   // mysql 정보
//   host: "127.0.0.1",
//   user: "root",
//   password: "123456",
//   port: "3306",
//   database: "nodejs_DB", // mysql에서 생성했던 database이름
// });

// 메인 페이지
router.get("/", function(request, response){
  console.log("은갱이가 서버 배운다!!");
})

router.post("/Join", function (request, response) {
  const userId = request.body.id;
  const userPw = request.body.pw;
  const userName = request.body.name;
  const userNick = request.body.nick;
  const userEmail = request.body.email;
  const userBirth = request.body.birth;
  const userGender = parseInt(request.body.gender);

  let sql = "insert into user_info(user_id, user_pw, user_name, user_nick, user_email, user_birth, user_gender) values(?, sha1(?), ?, ?, ?, ?, ?)";
  conn.query(sql, [userId, userPw, userName, userNick, userEmail, userBirth, userGender], function (err, rows) {
    if (!err) {
      console.log("회원가입 완료!");
      response.json({
        result : "회원가입 성공"
      });
    } else {
      console.log("회원가입 실패!" + err);
      response.json({
        result : "회원가입 실패"
      });
    }
  });
});

router.post("/Login", function (request, response) {
  console.log("로그인 서버 접속 감지!");
  const userId = request.body.id;
  const userPw = request.body.pw;
  console.log(request.body);
  // if( userID == "smhrd", userPW == "123"){
  //   response.json({
  //     result : "성공",num : "1"
  //   });
  // } else{
  //   response.json({
  //     result : "실패",num : "0"
  //   })
  // }
  let sql = "select * from user_info where user_id = ? and user_pw = sha1(?)";
  conn.query(sql, [userId, userPw], function (err, rows) {
    if (rows) {
      console.log("로그인 성공!");
      console.log(rows[0].user_nick)
      
      
      response.json({
        result : "로그인 성공",
        userInfo : rows[0].user_nick,
      })
    } else {
      console.log("로그인 실패!" + err);
    }
  });
});
module.exports = router;