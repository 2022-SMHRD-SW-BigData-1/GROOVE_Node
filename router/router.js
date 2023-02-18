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
  multipleStatements: true
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
  console.log("GROOVE 접속!");
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
  let song_list = [];
  console.log(request.body);
  let sql = "select U.*, S.song_id, S.songlist_date from user_info U inner join songlist_info S on U.user_seq = S.user_seq where user_id = ? and user_pw = sha1(?)";
  conn.query(sql, [userId, userPw], function (err, rows) {
    if (rows) {
      console.log("로그인 성공!");
      console.log(rows[0].user_nick);
      console.log(rows[0].user_favart);
      if(!rows[0].user_favart){
        rows[0].user_favart = "";
      }
      for(let i=0; i<rows.length; i++){
        console.log(rows[i].song_id);
        song_list.push(rows[i].song_id);
      }
      response.json({
        result : "로그인 성공",
        user_seq : rows[0].user_seq,
        userNick : rows[0].user_nick,
        favArt : rows[0].user_favart,
        recentSong : rows[0].user_recent,
        favSong : rows[0].user_favsong,
        song_list : song_list.reverse()
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
  let video_url = [];
  let artist_name = [];
  let video_title = [];
  let artist_id = [];
  let song_id = [];
  let song_lyrics = [];

  // 2곡에서 분위기를 꺼내와
  let sql = "select L.song_lyrics, S.song_title, S.song_id, S.album_id, A.artist_name, S.song_theme, V.video_url, V.video_title, A.artist_id from song_info S inner join artist_song C on S.song_id = C.song_id inner join artist_info A on C.artist_id = A.artist_id inner join video_url V on C.artist_id = V.artist_id inner join lyrics_info L on S.song_id = L.song_id where S.song_theme in (select song_theme from song_info where song_id in (?, ?))"
    conn.query(sql, [userRecSong[0], userRecSong[1]], function (err, rows) {
      if(rows){
        for(let i=0;i<9;i++){
          let ranNum = parseInt(Math.random() * rows.length);    
          artist_name.push(rows[ranNum].artist_name);
          song_title.push(rows[ranNum].song_title);
          album_img.push(rows[ranNum].album_id);
          video_url.push(rows[ranNum].video_url);
          video_title.push(rows[ranNum].video_title);
          artist_id.push(rows[ranNum].artist_id);
          song_id.push(rows[ranNum].song_id);
          song_lyrics.push(rows[ranNum].song_lyrics);
        }
        
        response.json({
          song_title : song_title,
          artist_name : artist_name,
          album_img : album_img,
          video_url : video_url,
          video_title : video_title,
          artist_id : artist_id,
          song_id : song_id,
          song_lyrics : song_lyrics
        });
        
        
        
      } else{
        console.log("전송실패!" + err);
      }    
  });
});

router.post("/MVplayer", function (request, response) {
  const artist_id = request.body.artistid;
  //request.body.id;
  console.log(request.body.id);

  let sql = "select L.song_lyrics, A.artist_name, V.video_title, V.video_url from video_url V inner join artist_song C on V.song_id = C.song_id inner join artist_info A on C.artist_id = A.artist_id inner join lyrics_info L on V.song_id = L.song_id where V.artist_id = ?";

  conn.query(sql, [artist_id], function (err, rows) {
    if (rows) {
      console.log("전송성공");

      response.json({
        result : "성공",
        lyrics : rows[0].song_lyrics,
        artistName : rows[0].artist_name,
        videoTitle : rows[0].video_title,
        videoUrl : rows[0].video_url
      })
      
    } else {
      console.log("전송실패!" + err);
    }
  });

});

router.post("/SongList", function (request, response) {
  console.log("재생 목록 불러오기");
  // let song_id = request.body.song_list;
  const user_seq = request.body.user_seq;
  // console.log(song_id);
  // song_id = song_id.replace("[", "");
  // console.log(song_id);
  // song_id = song_id.replace("]", "");
  // console.log(song_id);
  // song_id = song_id.split(",");
  // console.log(song_id);

  let song_title = [];
  let artist_name = [];
  let album_img = [];
  let song_lyrics = [];
  
  let sql = "select distinct R.song_lyrics, S.song_title, A.artist_name, S.album_id from song_info S inner join artist_song C on S.song_id = C.song_id inner join artist_info A on C.artist_id = A.artist_id inner join lyrics_info R on S.song_id = R.song_id where S.song_id in (select distinct L.song_id from songlist_info L inner join user_info U on L.user_seq = U.user_seq where U.user_seq = ?)";
  conn.query(sql, [user_seq], function (err, rows) {
    if (rows) {

      for(let i=0; i<rows.length; i++){
        song_title.push(rows[i].song_title);
        artist_name.push(rows[i].artist_name);
        album_img.push(rows[i].album_id);
        song_lyrics.push(rows[i].song_lyrics);
      }

      console.log(rows.length);
      console.log(song_title);
      console.log(artist_name);
      console.log(album_img);

      response.json({
        song_title : song_title.reverse(),
        artist_name : artist_name.reverse(),
        album_img : album_img.reverse(),
        song_lyrics : song_lyrics.reverse()
      });
      

    } else {
      console.log("재생목록 불러오기 실패!" + err);
    }
  });


});

router.post("/InsertList", function (request, response) {
  console.log("재생 목록 업데이트하기");
  const user_seq = request.body.user_seq;
  const song_id = request.body.song_id;
  console.log(user_seq);
  console.log(song_id);
  
  let song_list = [];

  let sql = "insert into songlist_info(user_seq, song_id) values(?, ?)";
  conn.query(sql, [user_seq, song_id], function (err, rows) {
    if (!err) {
      sql = "select distinct * from songlist_info";
      conn.query(sql, function(err, rows){

        for(let i=0; i<rows.length; i++){
          song_list.push(rows[i].song_id);
        }
        console.log(song_list);
        console.log(song_list.reverse());

        response.json({
          result : "재생목록 업데이트!",
          song_list : song_list.reverse()
        });
        

      })
      


    } else {
      console.log("재생목록 업데이트 실패!" + err);
    }
  });
});

router.post("/TagList", function (request, response) {
  console.log("태그곡 업데이트!");
  const tagName = request.body.tagName;
  console.log(tagName);

  let artist_name = [];
  let song_title = [];
  let album_img = [];
  let artist_id = [];
  let song_id = [];
  let song_lyrics = [];

  let sql = "select tag_theme from tag_info where tag_name = ?";
  conn.query(sql, [tagName], function (err, rows) {
    console.log(rows[0].tag_theme);
    let tag_theme = rows[0].tag_theme.split(", ");
    if(tag_theme.length==1){
      if(rows.length>0){

        for(let i=0;i<9;i++){
          let ranNum = parseInt(Math.random() * rows.length);    
          artist_name.push(rows[ranNum].artist_name);
          song_title.push(rows[ranNum].song_title);
          album_img.push(rows[ranNum].album_id);
          artist_id.push(rows[ranNum].artist_id);
          song_id.push(rows[ranNum].song_id);
          song_lyrics.push(rows[ranNum].song_lyrics);
        }
  
        console.log(artist_name);
        response.json({
          song_title : song_title,
          artist_name : artist_name,
          album_img : album_img,
          artist_id : artist_id,
          song_id : song_id,
          song_lyrics : song_lyrics
        });
  
      }
    } else{
      if(rows.length>0){

        for(let i=0;i<9;i++){
          let ranNum = parseInt(Math.random() * rows.length);    
          artist_name.push(rows[ranNum].artist_name);
          song_title.push(rows[ranNum].song_title);
          album_img.push(rows[ranNum].album_id);
          artist_id.push(rows[ranNum].artist_id);
          song_id.push(rows[ranNum].song_id);
          song_lyrics.push(rows[ranNum].song_lyrics);
        }
  
        console.log(artist_name);
        response.json({
          song_title : song_title,
          artist_name : artist_name,
          album_img : album_img,
          artist_id : artist_id,
          song_id : song_id,
          song_lyrics : song_lyrics
        });
  
      }
    }
    
  });
});

module.exports = router;