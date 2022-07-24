const mongogogo = require('../parent/Mongogogo');

// 방 스키마
const roomModelClass = new mongogogo.Schema({
    'nest': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Nests'
    },
    'parent': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Rooms',
    },
    'title': {
        type: String,
        required: true,
    },
    'makeAnt': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Ants',
    },
    'accessLevel': Number,
    'contents': [
        {
            'value': {
                type: mongogogo.SchemaTypes.Mixed
            },
            'code': Number
        }
    ],
    'children': [{
        'oid': {
            type: mongogogo.SchemaTypes.ObjectId,
            ref: 'Rooms',
        }
    }],
});

roomModelClass.index({'nest':1, 'title':1}, {unique: true});

const roomModelGen = mongogogo.model('Rooms', roomModelClass);

module.exports = {
    'class': roomModelClass,
    'gen': roomModelGen,
};