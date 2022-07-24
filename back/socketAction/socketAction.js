const antAction = require('../db/modelAction/antModelAction');
const nestAction = require('../db/modelAction/nestModelAction');
const roomAction = require('../db/modelAction/roomModelAction');
const antNestAction = require('../db/modelAction/antNnestModelAction');
const commonFunction = require('./common');

const socketRegist = (socket, socket_io)=>{
    try{
        socket.on('regist_request', async (data)=>{ // 소켓에 회원가입 리스너 등록
            var result = {
                code: 0,
                result: null
            };

            var antForm = {
                'id': data.id,
                'name': data.name,
            };

            if(commonFunction.checkID(antForm.name)){ // 회원가입 할 이름 정규식으로 점검
                var tempResult = await antAction.makeAnt(antForm); // 회원가입 진행

                if(tempResult){
                    result.code = 0;
                    result.result = `성공 당신의 아이디는 '${tempResult}' 입니다.`;
                } else{
                    result.code = 1;
                    result.result = '실패했습니다. 다른 이름을 사용해주세요.';
                }
            } else{
                result.code = 2;
                result.result = '실패했습니다. 이름 형식을 맞춰주세요.';
            }

            socket.emit('regist_result', result);
        });
    }
    catch(error){
        console.log(error);
    }
};

const socketLogin = (socket, socket_io, redis)=>{
    try{
        // console.log(redis);
        socket.on('login_request', async (data)=>{ // 소켓에 로그인 리스너 등록
            var result = {
                code: 0,
                result: null
            };

            var id = data;

            try{
                var tempResult = await antAction.loginAnt(id); // 로그인 진행

                if(tempResult){
                    tempResult.name = commonFunction.makeStringFromBase64(tempResult.name);

                    socket.userinfo = tempResult;

                    var tempTempResult = Object.assign({}, tempResult); // 객체 복사
                    tempTempResult._doc._id = tempTempResult._doc._id.toString();
                    tempTempResult._doc = {'userInfo': tempTempResult._doc};

                    console.log((await redis.setEx(tempResult._id.toString(), 600000, JSON.stringify(tempTempResult._doc)))); // 레디스에 로그인 정보 wjwkd

                    result.code = 0;
                    result.result = '로그인 성공';
                    result.name = tempResult.name;
                    result._id = tempResult._id;
                } else{
                    result.code = 1;
                    result.result = '실패했습니다. 아이디를 확인해주세요.';
                }
            }
            catch(error){
                console.log(error);
            }

            socket.emit('login_result', result);
        });
    }
    catch(error){
        console.log(error);
    }
};

const socketLogout = (socket, socket_io, redis)=>{
    var reuslt = {
        code: 0,
        result: '로그아웃 성공',
    };

    try{
        socket.on('logout_request', async (data)=>{ // 소켓에 로그아웃 리스너 등록
            console.log((await redis.del(socket.userinfo._id.toString()))); // 레디스에 로그인 정보 제거
            socket.userinfo = null; // 유저 정보 삭제
            socket.nest = null;     // 현재 둥지 정보 삭제

            socket.emit('logout_result', reuslt);
        });
    }
    catch(error){
        console.log(error);
    }
};

const getNestsList = (socket, socket_io)=>{
    try{
        socket.on('nests_find_request', async (data)=>{ // 둥지 검색 리스너 등록
            var result = {
                result: [],
                code: 0,
            };
            
            if(socket.userinfo){ // 로그인시에만 사용가능
                data = data || {};
                
                data.userinfo = socket.userinfo;

                result.result = await nestAction.findNest(data);
                socket.emit('nests_find_result', result);
            } else{
                socket.emit('login_please', '로그인 해주세요.');
            } 
        });
    }
    catch(error){
        console.log(error);
    }
};

const makeNest = (socket, socket_io)=>{
    try{
        socket.on('make_nest_request', async (data)=>{ // 둥지 생성 리스너 등록
            var result = null;
            
            if(socket.userinfo && data.name){ // 로그인한 상태여야 사용가능, 만들 둥지이름이 필요함
                data.userinfo = socket.userinfo;
                result = await nestAction.makeNest(data); // 둥지 등록
                socket.emit('make_nest_result', result);
            } else if(data.name){
                socket.emit('login_please', '로그인 필요!');
            } 
        });
    }
    catch(error){
        console.log(error);
    }
};

const registNest = async (socket, socket_io)=>{
    try{
        socket.on('regist_nest_request', async (data)=>{ // 둥지 가입 리스너 등록
            var result = null;
            
            if(socket.userinfo && data.name){ // 로그인한 상태여야 사용가능, 가입할 둥지이름이 필요함
                data.userinfo = socket.userinfo;
                result = await nestAction.registNest(data); // 둥지 가입 기능

                socket.emit('regist_nest_result', result);
            } else if(data.name){
                socket.emit('login_please', '로그인 필요!');
            } 
        });
    }
    catch(error){
        console.log(error);
    }
};

const entracneNest = async (socket, socket_io, redis)=>{
    try{
        // console.log(redis);
        socket.on('entrance_nest_request', async (data)=>{ // 둥지 입장 리스너 등록
            var result = null;
            
            if(socket.userinfo){ // 유저가 로그인상태여야 한다.

                if(data.nestName){ // 유저가 둥지이름을 보냈어야 한다.
                    data.userinfo = socket.userinfo; 
                    result = await nestAction.entranceNest(data); // 둥지입장기능
                    socket.nest = result.nest;

                    var tempJson = JSON.parse((await redis.get(socket.userinfo._id.toString()))); // Redis에서 유저 정보 가져와서 JSON으로 파싱하기
                    tempJson.currentNest = socket.nest;

                    // 유저 레벨 얻기
                    tempJson.userLevel = await antNestAction.getLevel({'user_id':socket.userinfo._id.toString(), 'nest_id': tempJson.currentNest._id.toString()});
                    socket.userNestLevel = tempJson.userLevel;
                    result.userNestLevel = tempJson.userLevel;

                    // Redis에 현재 유저가 입장한 둥지 정보 저장
                    console.log(await redis.setEx(socket.userinfo._id.toString(), 600000, JSON.stringify(tempJson)));
                } else{
                    result = {
                        'result': '둥지이름을 입력해주세요.',
                        code: 3,
                    };
                }
                

                socket.emit('entrance_nest_result', result);
            } else{
                socket.emit('login_please', '로그인 필요!');
            } 
        });
    }
    catch(error){
        console.log(error);
    }
}

const outNest = async (socket, socket_io)=>{ 
    try{
        socket.on('out_nest_request', async (data)=>{ // 둥지 퇴장 리스너 등록
            var result = null;
            socket.nest = null; // 둥지 초기화
            socket.userNestLevel = null; // 유저의 둥지 레벨 초기화

            socket.emit('out_nest_result', result);
        });
    }
    catch(error){
        console.log(error);
    }
}

const requestRoom = async (socket, socket_io)=>{ 
    try{
        socket.on('request_room_request', async (data)=>{ // 방 요청 리스너 등록
            var result = null;

            if(!socket.userinfo){ // 로그인 하지 않았을 경우
                result = {
                    'result': '로그인 후 이용가능',
                    code: 1,
                };
            } else if(!socket.nest){ // 둥지에 입장하지 않았을 경우
                result = {
                    'result': '둥지에 먼저 입장해야 이용가능',
                    code: 2,
                };
            } else{ // 로그인 하고 둥지에 입장한 경우
                data.userinfo = socket.userinfo;
                data.nest = socket.nest;
                result = await roomAction.findRoom(data); // 특정 둥지의 첫번째 방 찾기
            }

            socket.emit('request_room_result', result);
        });
    }
    catch(error){
        console.log(error);
    }
}

module.exports = {
    socketRegist, socketLogin, socketLogout, getNestsList, makeNest, registNest, entracneNest, outNest, requestRoom
};