const mongogogo = require('../parent/Mongogogo');

// 둥지 스키마
const nestModelClass = new mongogogo.Schema({
    'name': {
        type: String,
        unique: true,
        required: true,
    },
    'queen': {
        type: mongogogo.SchemaTypes.ObjectId,
        ref: 'Ants'
    },
    'info': {
        'onlyMyAnts': {
            type: Boolean,
            default: true,
        },
        'itsFree': {
            type: Boolean,
            default: false
        },
        'antConfig': {
            'levelMap': [{
                level: {
                    type: Number,
                }, 
                nickName: {
                    type: String,
                },
            },],
            'myAnts': [
                {
                    'oid': {
                        type: mongogogo.SchemaTypes.ObjectId,
                        ref: 'Ants',
                    }
                }
            ],
        },
        'rooms': [{
            'oid': {
                type: mongogogo.SchemaTypes.ObjectId,
                ref: 'Rooms',
            }
        }],
        'value': String,
    }
});

const nestForm = {
    'name': '',
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

const nestModelGen = mongogogo.model('Nests', nestModelClass);

module.exports = {
    'class': nestModelClass,
    'gen': nestModelGen,
};