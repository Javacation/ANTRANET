const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/test') // Mongoose 연결
.then((param)=>{
    console.log('mongodb connect');
})
.catch((error)=>{
    console.log(error);
});


module.exports = mongoose;