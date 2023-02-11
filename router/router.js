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

  let sql = "select * from user_info where user_id = ? and user_pw = sha1(?)";
  conn.query(sql, [userId, userPw], function (err, rows) {
    if (rows) {
      console.log("로그인 성공!");
      console.log(rows[0].user_nick);
      console.log(rows[0].user_favart);

      if(!rows[0].user_favart){
        rows[0].user_favart = "";
      }
      
      response.json({
        result : "로그인 성공",
        userNick : rows[0].user_nick,
        favArt : rows[0].user_favart,
        recentSong : rows[0].user_recent,
        favSong : rows[0].user_favsong
      })
    } else {
      console.log("로그인 실패!" + err);
    }
  });
});

router.post("/RecommendSong", function(request, response){
  console.log("추천곡 서버 접속 감지!");
  let userRecSong = (request.body.recSong).split(", ");

  if(userRecSong == null){
    userRecSong = (request.body.favSong).split(", ");
  }
  const userFavArt = (request.body.favArt).split(", ");
  console.log(request.body);
  console.log(userRecSong);
  console.log(userFavArt);

  let song_title = [];
  let album_img = [];
  let song_id = [];
  let artist_name = [];

  // 2곡에서 분위기를 꺼내와
  sql = "select S.song_title, A.artist_name, S.album_id from song_info S inner join artist_song C on S.song_id = C.song_id inner join artist_info A on C.artist_id = A.artist_id where S.song_theme in (select song_theme from song_info where song_id in (?, ?))";
  conn.query(sql, [userRecSong[0], userRecSong[1]], function (err, rows) {
    if(rows){
             
      for(let i=0;i<9;i++){
        let ranNum = parseInt(Math.random() * rows.length);    
        artist_name.push(rows[ranNum].artist_name);
        song_title.push(rows[ranNum].song_title);
        album_img.push(rows[ranNum].album_id);
      }

      console.log("여기도봐봐" + artist_name.length);
              
      response.json({
      song_title : song_title,
      artist_name : artist_name,
      album_img : album_img

    });
      
    } else{
      console.log("전송실패!" + err);
    }    
  });
});

router.post("/MVplayer", function (request, response) {
  const song_id = request.body.id;
  console.log(request.body.id);
  let sql = "select song_lyrics from song_info where song_id = ?;";
  let sql2 = "select artist_name from artist_info where artist_id = (select artist_id from artist_song where song_id = ?);";
  let sql3 = "select video_title, video_url from video_url where artist_id = (select artist_id from artist_song where song_id = ?);";
  conn.query(sql + sql2 + sql3, [song_id, song_id, song_id], function (err, rows, field) {
    if (rows) {
      console.log("전송성공");
      let sql1_res = rows[0];
      let sql2_res = rows[1];
      let sql3_res = rows[2];
      console.log(sql1_res);
      console.log(sql2_res);
      console.log(sql3_res);
      response.json({
        result : "성공",
        artistInfo : rows[0].artist_name,
        favart : rows[2]
      })
    } else {
      console.log("전송실패!" + err);
    }
  });
});

module.exports = router;