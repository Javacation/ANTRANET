const IDRegExp = /^[0-9A-Za-z]{3,15}$/; // 특수문자를 금지한 문자 3개이상 15개 이하


module.exports = {
    checkID: (data)=>{ // 아이디 점검
        if(data === null || data === undefined){
            return false;
        } else{
            return IDRegExp.test(data);
        }
    },

    makeStringFromBase64: (data)=>{ // Base64 데이터 문자열로 변환
        if(data === null || data === undefined){
            return '';
        } else{
            return Buffer.from(data, 'base64').toString("utf8");
        }
    },
    makeBase64FromString: (data)=>{
        if(data === null || data === undefined){ // 문자열 데이터 Base64로 변환
            return '';
        } else{
            return Buffer.from(data, 'utf8').toString("base64");
        }
    }
};