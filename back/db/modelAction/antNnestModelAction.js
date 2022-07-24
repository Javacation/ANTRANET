const nestsModelClass = require('../modelHouse/nestsModelClass');
const nests = require('../modelHouse/nestsModelClass');
const nestModelAction = require('./nestModelAction');
const mongogogo = require('../parent/Mongogogo');
const antNnestModelClass = require('../modelHouse/antNnestModelClass');

module.exports = {
    connectAntWithNest: async (payload)=>{

    },
    findNest: async (payload)=>{

    },
    getLevel: async (payload)=>{
        var level = {
            nickName: '',
            level: -1,
            _id: -1,
        };

        var user_id = payload.user_id; // string
        var nest_id = payload.nest_id; // string

        // console.log(user_id, nest_id);

        try {
            var nestInfo = await nestsModelClass.gen.find({'_id': {$eq: mongogogo.Types.ObjectId(nest_id)}});
            var userNnestInfo = await antNnestModelClass.gen.find({'ant': {$eq: mongogogo.Types.ObjectId(user_id)}, 'nest':{$eq: mongogogo.Types.ObjectId(nest_id)}});

            // console.log(nestInfo);
            // console.log(userNnestInfo);

            if(userNnestInfo && userNnestInfo.length > 0 && nestInfo && nestInfo.length > 0){
                for(var i in nestInfo[0].info.antConfig.levelMap){
                    if(nestInfo[0].info.antConfig.levelMap[i]._id.toString() == userNnestInfo[0].level.toString()){
                        level = nestInfo[0].info.antConfig.levelMap[i];
                    }
                }
            } else{

            }
        }
        catch (error) {
            console.log(error);
        }

        return level;
    }
};