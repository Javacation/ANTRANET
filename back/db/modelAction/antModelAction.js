const mongogogo = require('../parent/Mongogogo');
const commonFunction = require('../../socketAction/common');

const antModel = require('../modelHouse/antModelClass');



module.exports = {
    makeAnt: async (payload)=>{ // 유저 생성
        var result = null;

        var tempPayload = {
            id: payload.id,
            name: commonFunction.makeBase64FromString(payload.name),
        };

        try{
            var tempResult = await antModel.gen(tempPayload).save(); // 아이디, 이름 저장

            if(tempResult){
                result = tempPayload.id
            }
        }
        catch(error){
            console.log(error);
        }

        return result;
    },
    loginAnt: async (payload)=>{ // 유저 로그인
        var result = null;

        try{
            var res = await antModel.gen.find({'id': payload}); // 유저가 존재하는지 확인

            if(res && res.length === 1) { // 있음
                result = res[0];
            }
        }
        catch(error){
            console.log(error);
            result = null;
        }

        return result;
    },
};