const mongogogo = require('../parent/Mongogogo');
const commonFunction = require('../../socketAction/common');

const nestsModel = require('../modelHouse/nestsModelClass');
const antModelClass = require('../modelHouse/antModelClass');
const roomsModelClass = require('../modelHouse/roomsModelClass');
const antNnestModelClass = require('../modelHouse/antNnestModelClass');
const nestsModelClass = require('../modelHouse/nestsModelClass');

module.exports = {
    makeNest: async (payload)=>{ // 둥지를 만드는 기능
        var result = {
            result: '',
            code: 0,
        };

        var db_result = null;
        var find_by_name = { // 둥지 찾는 형식
            'name': {
                $eq: payload.name,
            },
        }

        var tempForm = { // 둥지 형식
            'name': payload.name,
            'queen': '',
            'info': {
                'onlyMyAnts': true,
                'itsFree': false,
                'antConfig': {
                    'levelMap': [],
                    'myAnts': [],
                },
                'rooms': [],
                'value': '',
            }
        };

        try {
            db_result = await nestsModel.gen.find(find_by_name); // 이미 특정 이름의 둥지가 존재하는지 확인

            if(db_result && db_result.length === 0){ // 둥지없음 
                db_result = await antModelClass.gen.find({'id':payload.userinfo.id}); // 현재 유저가 존재하는지 확인

                if(db_result && db_result.length > 0){ // 유저가 존재함
                    tempForm.queen = db_result[0]._id;

                    db_result = await nestsModel.gen(tempForm).save(); // 둥지저장

                    if(db_result){ // 저장성공
                        tempForm._id = db_result._id; // 둥지 _id 저장

                        // 둥지에 기본 권한 등록
                        // 0 일개미
                        // 1000000000 여왕개미
                        db_result = await nestsModel.gen.updateOne(find_by_name, {$push: {'info.antConfig.levelMap': {'level': 0, 'nickName': 'WorkAnt'}}});
                        db_result = await nestsModel.gen.updateOne(find_by_name, {$push: {'info.antConfig.levelMap': {'level': 1000000000, 'nickName': 'QueenAnt'}}});

                        if(db_result && db_result.modifiedCount > 0){ // 등록성공
                            var roomModel = { // 방 형식
                                'nest': tempForm._id,
                                'accessLevel': 0,
                                'parent': null,
                                'title': 'index',
                                'makeAnt': tempForm.queen,
                                'contents': [{'code': 0, 'value': 'Hello World'}],
                                'children': [],
                            };

                            var temp = db_result = await roomsModelClass.gen(roomModel).save(); // 방 저장
                            
                            // 둥지를 만든 유저와 기본 방 등록
                            db_result = await nestsModel.gen.updateOne(find_by_name, {$push: {'info.rooms': {'oid': temp._id,}}});
                            db_result = await nestsModel.gen.updateOne(find_by_name, {$push: {'info.antConfig.myAnts': {'oid': tempForm.queen,}}});

                            if(db_result){ // 등록 성공
                                db_result = await nestsModel.gen.find(find_by_name, {'info.antConfig.levelMap._id': 1}); // 현재 둥지의 접근 권한 레벨 배열 가져옴

                                db_result = await antNnestModelClass.gen( // 현재 유저 최고 관리자로 등록
                                    {
                                        'ant': tempForm.queen, 
                                        'nest': tempForm._id, 
                                        'level': db_result[0].info.antConfig.levelMap[1]._id
                                    }
                                ).save();
                                    
                                if(db_result){ // 관리자 등록 성공
                                    result.result = `둥지 ${tempForm.name}를 만드는데 성공했습니다!`;
                                    result.code = 0; 
                                } else{
                                    result.result = `여왕개미 등록실패!`;
                                    result.code = 6; 
                                }
                            } else{
                                result.result = '첫번째 방 생성 실패!';
                                result.code = 5; 
                            }
                        } else{ 
                            result.result = '일개미 생성실패!';
                            result.code = 4; 
                        }
                    } else{
                        result.result = '둥지 생성 실패!';
                        result.code = 3; 
                    }
                } else{
                    result.result = '다시 로그인 후 진행해주세요.';
                    result.code = 2;
                }
            } else if(db_result.length !== 0){
                result.result = '이미 존재하는 둥지입니다.';
                result.code = 1;
            }
        }
        catch (error) {
            result.result = '오류발생!';
            result.code = 100;

            // 실패 시 방 삭제
            roomsModelClass.gen.deleteOne({'nest': {$eq: tempForm._id}}).exec((err, res)=>{
                if(err) console.log(err);
            });

            // 실패 시 둥지 삭제
            nestsModel.gen.deleteOne({'_id': {$eq: tempForm._id}}).exec((err, res)=>{
                if(err) console.log(err);
            });

            console.log(error);
        }

        return result;
    },
    findNest: async (payload)=>{ // 둥지를 찾는 기능
        var result = [];
        var db_result = [];
        var find_by_name = {
            'name': {
                $regex: payload.regex || '.*',
            },
        }

        var skip_limit = {
            page: payload.page || 1,
            pageSize: payload.pageSize || 5
        };

        try{
            db_result = await nestsModel.gen.find(find_by_name) // 이름이 정규식에 포함되는 정보 검색 pagination 해서 검색
            .populate('queen')
            .skip((skip_limit.page-1)*skip_limit.pageSize)
            .limit(skip_limit.pageSize);

            for(var i in db_result){ // 찾은 둥지정보를 저장
                var tempJson = { 
                    'name': db_result[i].name,
                    'queenName': commonFunction.makeStringFromBase64(db_result[i].queen.name),
                    'rooms': db_result[i].info.rooms.length,
                    'totalAnt': db_result[i].info.antConfig.myAnts.length
                };
                
                var tempBool = false;

                for(var j in db_result[i].info.antConfig.myAnts){ // 현재 가입한 둥지는 가입했다는 정보를 포함시킨다.
                    if(db_result[i].info.antConfig.myAnts[j].oid.toString() === payload.userinfo._id.toString()){
                        tempBool = true;
                        break;
                    }
                }
                tempJson.imhere = tempBool;

                result.push(tempJson); // 배열에 삽입
            }      
        }
        catch(error){
            console.log(error);
        }

        return result;
    },

    registNest: async (payload)=>{
        var result = {
            result: '',
            code: 0,
        };

        var db_result = null;
        var find_by_name = { // 둥지 찾는 형식
            'name': {
                $eq: payload.name,
            },
        }

        var tempForm = { // 둥지 형식
            'name': payload.name,
            'queen': '',
            'info': {
                'onlyMyAnts': true,
                'itsFree': false,
                'antConfig': {
                    'levelMap': [],
                    'myAnts': [],
                },
                'rooms': [],
                'value': '',
            }
        };

        try {
            db_result = await nestsModel.gen.find(find_by_name); // 현재 둥지 검색

            if(db_result && db_result.length === 1){ // 둥지가 있음
                tempForm._id = db_result[0]._id;
                db_result = await nestsModel.gen.find(find_by_name, {'info.antCofig.myAnts': 1}); // 둥지 배열 

                for(var i in db_result){ // 둥지에 가입했는지 확인
                    if(db_result[i]._id == payload.userinfo._id){
                        console.log(db_result[i]._id, payload.userinfo._id);

                        result.result = '이미 가입한 둥지입니다.';
                        result.code = 2;
                    }
                }

                if(result.code !== 2){ // 둥지에 가입하지 않은 상태
                    // 둥지에 유저 ID 삽입
                    db_result = await nestsModel.gen.updateOne(find_by_name, {$push: {'info.antConfig.myAnts': {'oid': mongogogo.Types.ObjectId(payload.userinfo._id)}}});
                    // 둥지에서 권한배열 가져오기
                    db_result = await nestsModel.gen.find(find_by_name, {'info.antConfig.levelMap._id': 1});
                    

                    db_result = await antNnestModelClass.gen( // 유저, 둥지 테이블에 데이터 저장
                        {
                            'ant': payload.userinfo._id,                            // 유저 _id
                            'nest': tempForm._id,                                   // 둥지 _id
                            'level': db_result[0].info.antConfig.levelMap[0]._id    // 레벨 0
                        }
                    ).save();
                    
                    if(db_result){
                        result.result = '둥지에 가입했습니다.';
                        result.code = 0;
                    }
                } else{
                    result.result = '이미 가입한 둥지입니다.';
                    result.code = 2;
                }
            } else if(db_result.length !== 0){
                result.result = '존재하지 않는 둥지입니다.';
                result.code = 1;
            }
        }
        catch (error) {
            result.result = '오류발생!';
            result.code = 100;

            console.log(error);
        }

        return result;
    },

    entranceNest: async (payload)=>{ // 둥지 입장 기능
        var result = {
            result: '입장실패',
            code: -1,
        };

        try {
            result.nest = await nestsModel.gen.find({'name': {$eq: payload.nestName}}).populate([{path: 'info.rooms.oid', model: 'Rooms'}]); // 이름을 가진 둥지검색
            
            if(result.nest && result.nest.length > 0){ // 둥지가 존재할 경우
                var isIn = false;
                for(var i in result.nest[0].info.antConfig.myAnts){ // 유저가 둥지에 가입했는지 확인
                    if(result.nest[0].info.antConfig.myAnts[i].oid.toString() === payload.userinfo._id.toString()){
                        isIn = true;
                    }
                }

                for(var i in result.nest[0].info.rooms){ // 둥지 가진 모든 방에서 해당 방을 만든 개미 이름을 저장 BASE64에서 문자열로 바꿔 저장
                    var ant_id = result.nest[0].info.rooms[i].oid.makeAnt;
                    result.nest[0].info.rooms[i].oid.makeAnt = (await antModelClass.gen.find({_id: {$eq: mongogogo.Types.ObjectId(ant_id)}}))[0];
                    result.nest[0].info.rooms[i].oid.makeAnt.name = commonFunction.makeStringFromBase64(result.nest[0].info.rooms[i].oid.makeAnt.name);
                }

                if(isIn){ // 둥지에 입장성공
                    result.nest = result.nest[0];
                    result.code = 0;
                    result.result = '입장성공';
                } else{
                    result.result = '입장실패';
                    result.code = 4;
                }   
            } else{
                result.result = '존재하지 않는 둥지입니다.';
                result.code = 7;
            }
        }
        catch (error) {
            result.result = '오류발생!';
            result.code = 100;

            console.log(error);
        }

        return result;
    },
};
