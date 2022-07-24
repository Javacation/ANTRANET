const antNnestModelClass = require('../modelHouse/antNnestModelClass');
const nestsModelClass = require('../modelHouse/nestsModelClass');
const nests = require('../modelHouse/nestsModelClass');
const roomsModelClass = require('../modelHouse/roomsModelClass');
const mongogogo = require('../parent/Mongogogo');
const commonFunction = require('../../socketAction/common');

module.exports = {
    makeRoom: async (payload)=>{ // 방 만드는 기능
        var result = {
            result:"",
            code: -1,
        };
        var db_result = null;
        
        var user_info = payload.user_info; // string
        var nest = payload.nest; // json
        var room_info = payload.room; // json
        var user_level = payload.userLevel;

        try {
            if(user_level.level >= room_info.accessLevel){ // 방의 접근 권한이 유저의 접근 권한보다 작거나 같은 경우
                db_result = await roomsModelClass.gen.find({'title': {$eq: room_info.title}, 'nest': {$eq: nest._id}}); // 해당 제목을 가지는 방이 둥지에 존재하는지 확인

                if(db_result && db_result.length < 1){ // 둥지에 없는 경우
                    if(room_info.parent.length === 0){ // 부모지정 안해도됨
                        db_result = [false,];
                    } else{ // 부모 지정해야함
                        // 둥지에 부모가 될 방이 존재하는지 정보 가져옴
                        db_result = await roomsModelClass.gen.find({'_id': {$eq: mongogogo.Types.ObjectId(room_info.parent)}, 'nest': {$eq: nest._id}});
                    }

                    if(db_result && db_result.length > 0){ // 성공적으로 부모를 찾거나 지정하지 않아도 되는 경우
                        var parent_info = db_result[0]; // 부모 지정을 안했다면 false

                        var roomModel = { // 방 형식에 맞춰 데이터 주입
                            'nest': nest._id,
                            'accessLevel': room_info.accessLevel,
                            'parent': parent_info? parent_info._id: null,
                            'title': room_info.title,
                            'makeAnt': user_info._id,
                            'contents': room_info.content_count,
                            'children': [],
                        }

                        var tempRoom = db_result = await roomsModelClass.gen(roomModel).save(); // 방 저장

                        if(db_result){ // 글 저장 성공
                            if(roomModel.parent !== null){ // 부모가 지정된 경우
                                db_result = await roomsModelClass.gen.updateOne({'_id': {$eq: mongogogo.Types.ObjectId(room_info.parent)}}, {$push: {'children': {
                                    'oid': tempRoom._id,
                                }}}); // 부모로 지정된 방의 자식배열에 지금 저장한 방 삽입

                                if(db_result && db_result.modifiedCount > 0){ // 방 삽입 성공
                                    result.result = '글을 저장했습니다.';
                                    result.code = 0;
                                } else{ // 방 삽입 실패
                                    result.result = '해당글을 부모의 자식으로 등록하는데 실패했습니다.';
                                    result.code = 6;
                                }
                            } else{ // 부모가 지정되지 않은 경우
                                db_result = await nestsModelClass.gen.updateOne({'_id': {$eq: nest._id}}, {$push: {'info.rooms': {
                                    'oid': tempRoom._id,
                                }}}); // 둥지의 방 배열에 지금 저장한 방 삽입

                                if(db_result && db_result.modifiedCount > 0){ // 방 삽입 성공
                                    result.result = '글을 저장했습니다.';
                                    result.code = 0;
                                } else{ // 방 삽입 실패
                                    result.result = '글을 둥지에 등록하지 못했습니다.';
                                    result.code = 5;
                                }
                            }
                        } else{
                            result.result = '글을 저장하는데 실패했습니다.';
                            result.code = 4;
                        }
                    } else{
                        result.result = '둥지에 존재하지 않는 글을 부모로 지정할 수 없습니다.';
                        result.code = 3;
                    }
                } else{
                    result.result = '방제목을 바꿔서 시도해주세요.';
                    result.code = 2;
                }
            } else{
                result.result = '방을 만들권한이 부족합니다.';
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
    findRoom: async (payload)=>{
        var result = {
            result: '',
            code: 0,
        };

        var db_result = null;
        
        var room_id = payload._id; // string
        var nest = payload.nest; // json
        var userinfo = payload.userinfo; // json

        var room_info = null; // room_id, nest._id
        var room_level = null; // room_id, nest._id
        var user_level = null; // nest._id, userinfo._id

        var nestFind = { // 둥지 찾는 형식
            '_id': {
                $eq: nest._id
            }
        };

        var roomFind = { // 방 찾는 형식
            '_id': {
                $eq: mongogogo.Types.ObjectId(room_id)
            },
            'nest': {
                $eq: nest._id
            }
        }

        var userLevelFind = { // 유저 레벨 찾는 형식
            'ant': {
                $eq: userinfo._id
            },
            'nest': {
                $eq: nest._id
            }
        };

        try{
            // 방찾기
            db_result = await roomsModelClass.gen.find(roomFind).populate('makeAnt children.oid');

            if(db_result && db_result.length > 0){ // 방 있음
                room_info = db_result[0];
                room_level = db_result[0].accessLevel;

                // 유저, 둥지 레벨 찾기
                user_level = await antNnestModelClass.gen.find(userLevelFind);

                if(user_level && user_level.length > 0){ // 유저가 둥지에 가입한 경우
                    user_level = user_level[0].level;
                    db_result = await nestsModelClass.gen.find(nestFind); // 둥지 찾기

                    if(db_result && db_result.length > 0){ // 둥지가 존재하는 경우
                        nest = db_result[0];
                        var find = false;

                        for(var i in nest.info.antConfig.levelMap){ // 둥지에서 레벨권한을 찾아 유저레벨 구하기
                            if(nest.info.antConfig.levelMap[i]._id.toString() === user_level.toString()){
                                find = true;
                                user_level = nest.info.antConfig.levelMap[i].level;
                            }
                        }

                        if(find){ // 유저의 레벨이 존재하는 걸 확인
                            if(user_level >= room_level){ // 방 레벨이 유저보다 낮은 경우 방을 찾아줌
                                result.result = '찾았습니다!'
                                result.room = room_info;
                                result.room.makeAnt.name = commonFunction.makeStringFromBase64(result.room.makeAnt.name);
                            } else{
                                result.result = '권한이 부족합니다.';
                                result.code = 14;
                            }
                        } else{
                            result.result = '유저의 레벨을 찾지 못했습니다.';
                            result.code = 13;
                        }
                    } else{
                        result.result = '둥지에 가입해주세요.';
                        result.code = 12;
                    }
                } else{
                    result.result = '둥지에 가입해주세요.';
                    result.code = 11;
                }
            } else{
                result.result = '둥지에서 방을 찾지 못했습니다.';
                result.code = 10;
            }
        } catch(error){
            result.result = '오류발생!';
            result.code = 100;

            console.log(error);
        }

        return result;
    },
};