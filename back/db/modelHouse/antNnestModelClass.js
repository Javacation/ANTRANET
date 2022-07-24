const mongogogo = require('./../parent/Mongogogo');

// 유저, 둥지 스키마
const antNnestModelClass = new mongogogo.Schema({
    'ant': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Ants',
    },
    'nest': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Nests',
    },
    'level': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Nests.info.antConfig.levelMap'
    }
});

antNnestModelClass.index({'ant': 1, 'nest': 1}, {unique: true});

const antNnestModelGen = mongogogo.model('AntNNest', antNnestModelClass);

module.exports = {
    'class': antNnestModelClass,
    'gen': antNnestModelGen
};