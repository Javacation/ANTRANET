const mongogogo = require('./../parent/Mongogogo');

// 유저 스키마
const antModelClass = new mongogogo.Schema({
    'id': {
        type: String,
        unique: true,
        required: true,
    },
    'name': {
        type: String,
        unique: true,
        required: true,
    },
});

const antModelGen = mongogogo.model('Ants', antModelClass);

module.exports = {
    'class': antModelClass,
    'gen': antModelGen
};