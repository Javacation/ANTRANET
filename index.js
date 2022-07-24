const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const REDIS = require('redis');
const cookieParser = require('cookie-parser');
// const RedisStore = require('connect-redis')(session);
const redis_client = REDIS.createClient(6379, 'localhost');

const redisConnect = async ()=>{
    try {
        var result = await redis_client.connect();
        console.log('REDIS CONNECT');
    }
    catch (error) {
        console.log(error);
    }
}

redisConnect(); // Redis 연결

app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'back', 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// 라우터 등록
app.use(require(path.join(__dirname, 'back', 'router', 'getRouter.js')));
app.use(require(path.join(__dirname, 'back', 'router', 'postRouter.js')));

// http 서버에 express 등록
const server = http.createServer(app); 
const socketIO = require('socket.io');  // 소켓 서버 생성
const socket_io = socketIO(server, {    // 소켓 서버 등록 및 CORS 정책 무시
    cors:{
        origin: '*',
    },
});

const chat_io = socket_io.of('/chat'); // chat namespace 등록

const { socketRegist, socketLogin, socketLogout, getNestsList, makeNest, registNest, entracneNest, outNest, requestRoom } = require('./back/socketAction/socketAction');

chat_io.on('connect', (socket)=>{ // 클라이언트 chat namespace 연결시 실행
    socket.on('plain_chat_request', (data)=>{
        var result = {};

        if(data && data.content){ // 로그인 상태인 경우 이름을 써서 broadcast
            if(data.sender) result.sender = data.sender;
            else result.sender = "익명";
        
            result.content = data.content;
            chat_io.emit('plain_chat_result', result);
        }
    })
})

socket_io.on('connect', (socket)=>{
    socketRegist(socket, socket_io);                // 회원가입 기능
    socketLogin(socket, socket_io, redis_client);   // 로그인 기능
    socketLogout(socket, socket_io, redis_client);  // 로그아웃 기능
    getNestsList(socket, socket_io);                // 둥지 조회 기능
    makeNest(socket, socket_io);                    // 둥지 생서 기능
    registNest(socket, socket_io);                  // 둥지 가입 기능
    entracneNest(socket, socket_io, redis_client);  // 둥지 입장 기능
    outNest(socket, socket_io, redis_client);       // 둥지 나가기 기능
    requestRoom(socket, socket_io);                 // 현재 둥지에서 전체 방요청

    socket.on('disconnect', (data)=>{ // 클라이언트 연결 끊김
        var str = `id: ${socket.id}, data: ${data}`;
        socket.userinfo = null;
        console.log(`id: ${socket.id} is disconnetd`);
    });
});

server.listen(3000, ()=>{
    console.log('http://localhost:3000');
});