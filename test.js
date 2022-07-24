const mongoose = require('./back/db/parent/Mongogogo');

const antModel = require('./back/db/modelHouse/antModelClass');
const nestModel = require('./back/db/modelHouse/nestsModelClass');
const roomModel = require('./back/db/modelHouse/roomsModelClass');
const antNnestModel = require('./back/db/modelHouse/antNnestModelClass');
const roomBlahModel = require('./back/db/modelHouse/roomBlahsModelClass');
const antNnestModelClass = require('./back/db/modelHouse/antNnestModelClass');

// const printFunc = (data)=>{
//     if(data){
//         for(var i in data){
//             if(data[i] !== '_id' && data[i] !== '__v'){
//                 console.log(data[i]);

                
//             }
//         }
//     }
// };

// testModel.gen.find({}).sort({_id: -1}).populate('parent').exec((err, res)=>{
//     console.log(res[0]);
// });


// antModel.gen.find({}).exec((err, res)=>{
//     if(err)
//         console.log(err);
//     else if(res && res.length > 0)
//         for(var i in res)
//             console.log(res[i].id, ' :: ', res[i].name);
//     else{
//         console.log('ant is not exist');
//     }   
// });

// antModel.gen({'id': 'firstAnt'+Date.now(), 'name': 'antName'+Date.now()}).save()
// .then((res)=>{
//     console.log(`add Ant :: ${res}`);
// })
// .catch((err)=>{
//     console.log(err);
// });

// var nest = {
//     'name': 'testNest',
//     'queen': mongoose.Types.ObjectId("629213724526b0f2f0cf9251"),
//     'info': {
//         'onlyMyAnts': false,
//         'itsFree': false,
//         'antConfig':{
//             'levelMap': [],
//             'myAnts': [],
//         },
//         'rooms': [],
//         'value': 'none'
//     }
// }

// nestModel.gen(nest).save()
// .then((res)=>{
//     console.log(`Nest`);
//     console.log(res);
// })
// .catch((err)=>{
// });

// nestModel.gen.find({'queen': {'$eq': mongoose.Types.ObjectId("629213724526b0f2f0cf9251")}, 'name': {'$regex': /^(test)/}}).exec(async (err, res)=>{
//     if(err)
//         console.log(err);
//     else if(res && res.length > 0){
//         // var oid = await antModel.gen.find({'id': {'$eq': res[0].queen}}, {'_id': 1});

//         // if(oid && oid.length > 0){
//         //     nestModel.gen.updateOne({'name': res[0].name}, {'$addToSet': {'info.antConfig.myAnts': oid[0]._id}})
//         //     .then((res)=>{
//         //         console.log(`Nest addToSetResult`);
//         //         console.log(res);
//         //     })
//         //     .catch((err)=>{
//         //         console.log(`Nest addToSetError`);
//         //         console.log(err);
//         //     });
//         // }
//         var addJson = {'level': 0, 'nickName': 'test'};
//         var res = await nestModel.gen.find({$or: [{'info.antConfig.levelMap.level': {$eq: addJson.level}}, {'info.antConfig.levelMap.nickName': {$eq: addJson.nickName}}], queen: {$eq: mongoose.Types.ObjectId("629213724526b0f2f0cf9251")}})

//         console.log(res, res.length);

//         if(res && res.length < 1){
//             nestModel.gen.updateOne({'name': res[0].name}, {'$push': {'info.antConfig.levelMap': addJson}})
//             .then((res)=>{
//                 console.log(`success`);
//                 console.log(res);
//             })
//             .catch((err)=>{
//                 console.log(`error`);
//                 console.log(err);
//             });
//         } else{
//             console.log('exist already');
//         }

        

//         // {'$push': {'info': {'antConfig': {'myAnts': {'oid': res[0].queen}}}}}
        
//     } else{
//         console.log('finding fail');
//     }
// })

// var room = {

// };

// nestModel.gen.find().exec((err, res)=>{
//     if(err){
//         console.log(err);
//     } else{
//         console.log(res[0]._id);

//         room.title = 'testRoom';
//         room.nest = res[0]._id;

//         roomModel.gen(room).save()
//         .then((res)=>{
//             console.log(`room`);
//             console.log(res);
//         })
//         .catch((err)=>{
//             // console.log(err);
//         });

//         roomModel.gen.find({}).populate([{path: 'nest'}, {path: 'nest', populate: {path: 'queen'}}]).exec((err, res)=>{
//             if(res){
//                 console.log(JSON.parse(JSON.stringify(res[0])));
//                 for(var i in res){
//                     console.log(res[i].nest.name, " : ", res[i].nest.info.antConfig);
//                 }
//             }
//         });
//     }
// })

const testFunc = async ()=>{
    try{
        var ant = await nestModel.gen.find({}).populate('info.rooms');
        var rooms = await roomModel.gen.find({'_id': {$all: ant[0].info.rooms}}).populate('children.oid');
        var accessLevel = await antNnestModelClass.gen.find({'ant': {$eq: rooms[0].makeAnt}, 'nest': {$eq: rooms[0].nest}}).populate('nest');
        // accessLevel = await nestModel.gen.find({'_id': {$eq: accessLevel._id}});

        console.log(ant[0].info.rooms);
        console.log(rooms);
        console.log(accessLevel[0].nest.info.antConfig.levelMap);
        var level = null;

        for(var i in accessLevel[0].nest.info.antConfig.levelMap) {
            if(accessLevel[0].nest.info.antConfig.levelMap[i]._id.toString() == accessLevel[0].level.toString())
                level = accessLevel[0].nest.info.antConfig.levelMap[i];
        }

        console.log(level.level);

        
    }
    catch(error){
        console.log(error);
    }
};


// testFunc();

// const redis = require('redis');

// const redis_cli = redis.createClient(6379, '127.0.0.1');

// redis_cli.connect()
// .then((data)=>{
//     console.log(data);
//     redis_cli.setEx('foo', 600, JSON.stringify({'value': 'bar'}))
//     .then((data)=>{
//         console.log(data);
//     })
//     .catch((data)=>{
//         console.log(data);
//     })
//     .finally((data)=>{

//         redis_cli.get('foo')
//         .then((data)=>{
//             console.log(data);
//         })
//         .catch((data)=>{
//             console.log(data);
//         })
//         .finally((data)=>{

//             // redis_cli.quit();
//         })
//     });
// })
// .catch((data)=>{
//     console.log(data);
// })
// .finally((data)=>{
// })



const test1 = async ()=>{
    try {
        // var tempLevel = (await antNnestModelClass.gen.find({}))[0].level;

        // console.log(tempLevel);

        // var aaa = await nestModel.gen.find({'info.antConfig.levelMap._id': {$eq: tempLevel}}, {'info.antConfig.levelMap._id': 1});

        // console.log(aaa);

        console.log(
            (await mongoose.Aggregate([
                {$group: {}},
            ]))
        );
    } catch (error) {
        console.log(error);
    }
}

test1();