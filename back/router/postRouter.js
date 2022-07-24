const express = require('express');
const router = express.Router();
const commonFunction = require('../socketAction/common');
const path = require('path');
const REDIS = require('redis');
const roomModelAction = require('../db/modelAction/roomModelAction');
const antNnestModelClass = require('../db/modelHouse/antNnestModelClass');
const nestsModelClass = require('../db/modelHouse/nestsModelClass');
const mongogogo = require('../db/parent/Mongogogo');
const redis_client = REDIS.createClient(6379, 'localhost');

// 방 하나 얻기
router.post('/getRoom', async (req, res)=>{
    var result = {
        result: '',
        code: -1,
    };

    try{
        if(!redis_client.isOpen) await redis_client.connect(); // Redis 연결 확인
        var tempData = JSON.parse((await redis_client.get(req.body.user_id)) || '{}'); // Redis에서 유저 정보 가져오기
        result.result = tempData; // 가져온 정보 저장

        if(tempData.userInfo && tempData.currentNest){ // 현재 로그인한 상태이면서 둥지에 입장했는지 확인
            tempData.userInfo._id = mongogogo.Types.ObjectId(tempData.userInfo._id); // 유저 ID 몽고DB 오브젝트 타입으로 변경

            if(req.body.room_id){ // 찾을 방 ID 구하기
                var data = {};
                data._id = req.body.room_id;
                data.nest = tempData.currentNest;
                data.userinfo = tempData.userInfo;
                data.userLevel = tempData.userLevel;

                result = await roomModelAction.findRoom(data); // 방 찾기 기능 호출
            } else{
                result.result = '방 _id가 필요합니다.';
            }
        } else if(!tempData.userInfo){
            result.result = '로그인후 이용할 수 있습니다.';
        } else if(!tempData.currentNest){
            result.result = '둥지 입장후 이용할 수 있습니다.';
        }
    }
    catch(error){
        console.log(error);
    }

    res.json(result);
});

// 방 만들기
router.post('/makeRoom', async (req, res)=>{
    var result = {
        result: '',
        code: -1,
    };

    try{
        if(!redis_client.isOpen) await redis_client.connect(); // Redis 연결 확인
        var tempData = JSON.parse((await redis_client.get(req.body.room.user_id)) || '{}'); // Redis에서 유저 정보 가져오기
        result.result = tempData; // 가져온 정보 저장

        if(tempData.userInfo && tempData.currentNest){ // 현재 로그인한 상태이면서 둥지에 입장했는지 확인
            tempData.userInfo._id = mongogogo.Types.ObjectId(tempData.userInfo._id); // 유저 ID 몽고DB 오브젝트 타입으로 변경
            req.body.room.accessLevel = req.body.room.accessLevel || 0; // 만들방 접근 권한파싱
            result = await roomModelAction.makeRoom({room: req.body.room, nest: tempData.currentNest, user_info: tempData.userInfo, userLevel: tempData.userLevel});
        } else if(!tempData.userInfo){
            result.result = '로그인후 이용할 수 있습니다.';
        } else if(!tempData.currentNest){
            result.result = '둥지 입장후 이용할 수 있습니다.';
        }
    }
    catch(error){
        console.log(error);
    }

    res.json(result);
})

// 권한 확인을 위해 둥지에포함된 자식배열을 가져옴
router.post('/getAntsList', async (req, res)=>{
    var result = {
        result: {
            nest: null,
            ants: []
        },
        code: -1,
    };

    try {
        if(!redis_client.isOpen) await redis_client.connect(); // Redis 연결 확인
        var tempData = JSON.parse((await redis_client.get(req.body.user_id)) || '{}'); // Redis에서 유저 정보 가져오기


        // 로그인한 상태이면서, 둥지에 입장한 상태이면서, 유저의 접근 권한이 관리자인 경우 실행
        if(tempData.userInfo && tempData.currentNest && tempData.userLevel.level === 1000000000){
            var db_result = null;
            tempData.userInfo._id = mongogogo.Types.ObjectId(tempData.userInfo._id); // 유저 ID 몽고DB 오브젝트 타입으로 변경

            db_result = await nestsModelClass.gen.find({'_id': {$eq: tempData.currentNest._id}}); // 현재 둥지 검색

            if(db_result && db_result.length > 0){ // 검색 결과가 존재할 경우
                result.result.nest = JSON.parse(JSON.stringify(db_result[0])); // 데이터 카피를 위한 변환과정 (가져온 데이터가 Readonly인지 assign이 제대로 적용되지 않음)

                // 유저, 둥지 테이블에서 특정 둥지에 속한 유저들을 ant에 들어간 _id값으로 전부 populate해서 검색
                db_result = await antNnestModelClass.gen.find({'nest': {$eq: tempData.currentNest._id}}).populate('ant');

                if(db_result && db_result.length > 0){ // 검색결과가 있음
                    for(var i in db_result){ // 모든 유저 데이터 복제
                        result.result.ants.push(JSON.parse(JSON.stringify(db_result[i])));
                    }

                    // 각 유저가 둥지에서 어떤 권한을 가지는지 값을 삽입
                    for(var i in result.result.ants){
                        for(var j in result.result.nest.info.antConfig.levelMap){
                            if(result.result.ants[i].level.toString() === result.result.nest.info.antConfig.levelMap[j]._id.toString())
                                result.result.ants[i].level = result.result.nest.info.antConfig.levelMap[j];
                        }
                        // 이름을 BASE64에서 decode한다.
                        result.result.ants[i].decodeName = commonFunction.makeStringFromBase64(result.result.ants[i].ant.name);
                    }

                    result.code = 0;
                } else{
                    result.result = '개미들을 가져오지 못했습니다.';
                    result.code = 2;
                }
            } else{
                result.result = '둥지를 가져오지 못했습니다.';
                result.code = 1;
            }
        } else if(!tempData.userInfo){
            result.result = '로그인후 이용할 수 있습니다.';
        } else if(!tempData.currentNest){
            result.result = '둥지 입장후 이용할 수 있습니다.';
        } else if(tempData.userLevel.level !== 1000000000){
            result.result = '관리자만 이용할 수 있습니다.';
        }
    }
    catch (error) {
        console.log(error);
    }

    res.json(result);
});

// 둥지에 권한추가
router.post('/addAuth', async (req, res)=>{
    var result = {
        result: '',
        code: -1,
    };

    var temp = null;

    try {
        if(!redis_client.isOpen) await redis_client.connect(); // Redis 연결 확인
        var tempData = JSON.parse((await redis_client.get(req.body.user_id)) || '{}'); // Redis에서 유저 정보 가져오기

        // 유저가 로그인 했으며, 둥지에 입장한 상태이며, 추가할 권한이 데이터로 넘어왔고
        // 관리자 권한을 가지며, 추가할 권한중 레벨이 있고 0보다 크고 1000000000보다 작은 경우 실행
        if(tempData.userInfo && tempData.currentNest && req.body.addAuth && tempData.userLevel.level === 1000000000 && req.body.addAuth.level >= 0 && req.body.addAuth.level < 1000000000){
            var db_result = null;
            tempData.userInfo._id = mongogogo.Types.ObjectId(tempData.userInfo._id); // 유저 ID 몽고DB 오브젝트 타입으로 변경

            // 둥지가 존재하는지 검색
            db_result = await nestsModelClass.gen.find({'_id': {$eq: tempData.currentNest._id}});

            if(db_result && db_result.length > 0){ // 둥지가 존재하는걸 확인
                temp = db_result[0];
                var isExist = false;

                for(var i in temp.info.antConfig.levelMap){ // 둥지에서 추가하려고 하는 레벨이 이미 존재하는지 확인
                    if(temp.info.antConfig.levelMap[i].level === req.body.addAuth.level){
                        isExist = true;
                    }
                }
                
                if(!isExist){ // 존재하지 않는경우 둥지 레벨 배열에 값 추가
                    db_result = await nestsModelClass.gen.updateOne({'_id': {$eq: tempData.currentNest._id}}, {$push: {'info.antConfig.levelMap': {'level': req.body.addAuth.level, 'nickName': req.body.addAuth.nickName || 'untitle Ant'}}});
                
                    if(db_result && db_result.modifiedCount > 0){ // 값 삽입 성공
                        result.result = '권한을 추가했습니다.';
                        result.code = 0;
                    } else{
                        result.result = '권한추가에 실패했습니다.';
                        result.code = 3;
                    }
                } else{
                    result.result = '이미 존재하는 권한입니다.';
                    result.code = 2;
                }
            } else{
                result.result = '둥지를 가져오지 못했습니다.';
                result.code = 1;
            }
        } else if(!tempData.userInfo){
            result.result = '로그인후 이용할 수 있습니다.';
        } else if(!tempData.currentNest){
            result.result = '둥지 입장후 이용할 수 있습니다.';
        } else if(!req.body.addAuth){
            result.result = '추가할 권한이 없습니다.';
        } else if(tempData.userLevel.level !== 1000000000){
            result.result = '관리자만 이용할 수 있습니다.';
        } else if(req.body.addAuth.level < 0 || req.body.addAuth.level >= 1000000000){
            result.result = `레벨 ${req.body.changeAuth}은 만들 수 없습니다.`;
        }
    }
    catch (error) {
        console.log(error);
    }

    res.json(result);
});

// 둥지에서 개미 권한 변경
router.post('/changeAntAuth', async (req, res)=>{
    var result = {
        result: '',
        code: -1,
    };

    var temp = null;

    try {
        if(!redis_client.isOpen) await redis_client.connect(); // Redis 연결 확인
        var tempData = JSON.parse((await redis_client.get(req.body.user_id)) || '{}'); // Redis에서 유저 정보 가져오기

        // 유저가 로그인 했으며, 둥지에 입장한 상태이며, 바꿀 권한이 숫자이며, 권한을 바꿀 아이디가 존재하고
        // 유저가 관리자 권한을 가지며, 바꿀 권한이 0보다 크고 1000000000보다 작은 경우 실행
        if(tempData.userInfo && tempData.currentNest && Number.isInteger(req.body.changeAuth) && req.body.change_id && tempData.userLevel.level === 1000000000 && req.body.changeAuth >= 0 && req.body.changeAuth < 1000000000){
            var db_result = null;
            tempData.userInfo._id = mongogogo.Types.ObjectId(tempData.userInfo._id); // 유저 ID 몽고DB 오브젝트 타입으로 변경

            // 둥지가 존재하는지 검색
            db_result = await nestsModelClass.gen.find({'_id': {$eq: tempData.currentNest._id}});

            if(db_result && db_result.length > 0){ // 둥지가 존재하는 경우
                temp = db_result[0];

                // 유저, 둥지 모델에서 권한을 바굴 유저가 둥지에 존재하는지 ant로 populate해 검색
                var tempUser =  
                db_result = await antNnestModelClass.gen.find({'nest': {$eq: tempData.currentNest._id}, 'ant': {$eq: mongogogo.Types.ObjectId(req.body.change_id)}}).populate('ant');

                if(db_result && db_result.length > 0){ // 결과가 존재하는 경우
                    tempUser = tempUser[0];
                    var level_id = null;

                    for(var j in temp.info.antConfig.levelMap){ // 바꿀 권한과 같은 레벨을 가지는 레벨객체의 _id 추출
                        if(req.body.changeAuth === temp.info.antConfig.levelMap[j].level)
                            level_id = temp.info.antConfig.levelMap[j]._id;
                    }
                    
                    if(level_id){ // 추출에 성공한 경우
                        // 유저의 둥지 레벨을 바꿀 권한으로 Update
                        db_result = await antNnestModelClass.gen.updateOne({'nest': {$eq: tempData.currentNest._id}, 'ant': {$eq: mongogogo.Types.ObjectId(req.body.change_id)}}, {'level': level_id});
                    
                        if(db_result && db_result.modifiedCount > 0){ // 변경에 성공한 경우
                            result.result = `${commonFunction.makeStringFromBase64(tempUser.ant.name)}의 권한을 변경했습니다.`;
                            result.code = 0;
                        } else{
                            result.result = '권한 변경에 실패했습니다.';
                            result.code = 4;
                        }
                    } else{
                        result.result = '둥지에 존재하지 않는 권한입니다.';
                        result.code = 3;
                    }
                } else{
                    result.result = '개미가 둥지에 속하는지 확인해주세요.';
                    result.code = 2;
                }
            } else{
                result.result = '둥지를 가져오지 못했습니다.';
                result.code = 1;
            }
        } else if(!tempData.userInfo){
            result.result = '로그인후 이용할 수 있습니다.';
        } else if(!tempData.currentNest){
            result.result = '둥지 입장후 이용할 수 있습니다.';
        } else if(!Number.isInteger(req.body.changeAuth)){
            result.result = '바꿀 권한을 입력해주세요.';
        } else if(!req.body.change_id){
            result.result = '권한을 바꿀 대상을 입력해주세요.';
        } else if(tempData.userLevel.level !== 1000000000){
            result.result = '관리자만 이용할 수 있습니다.';
        } else if(req.body.changeAuth < 0 || req.body.changeAuth >= 1000000000){
            result.result = `레벨 ${req.body.changeAuth}로는 바꿀 수 없습니다.`;
        }
    }
    catch (error) {
        console.log(error);
    }

    res.json(result);
});

module.exports = router;