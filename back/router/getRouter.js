const express = require('express');
const router = express.Router();
const path = require('path');

// 모든 get요청은 index.html 파일을 반환한다.
router.get(/.*/, (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;