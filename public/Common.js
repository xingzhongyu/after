let jwt=require("jsonwebtoken");
let crypto=require("crypto");
const resolve=require('path').resolve;
const CONFIG=require('./Config')
function paramAll(req){
    let parameter={};
    if(req.params){
        for(let p in req.params){
            parameter[p]=req.params[p];
        }
    }
    if(req.body){
        for(let p in req.body){
            parameter[p]=req.body[p];
        }
    }
    if(req.query){
        for(let p in req.query){
            parameter[p]=req.query[p];
        }
    }
    return parameter;
}
function encryPassword(pwd){//已经被by..替代
    pwd=CONFIG.TOKENSECRET+pwd;
    let md5=crypto.createHash('md5');
    let password=md5.update(pwd);
    pwd=md5.digest('hex');
    return pwd;

}
function setToken(email,userId){
    return new Promise((resolve,reject)=>{
        const token=jwt.sign({
            email,userId
        },CONFIG.TOKENSECRET,{
            expiresIn:'1h'
        });
        resolve(
            token
        )
    })
}

function verToken(token){
    return new Promise((resolve,reject)=>{
        let info=jwt.verify(token.split(' ')[1],CONFIG.TOKENSECRET);
        resolve(info);
    })
};
module.exports={
    paramAll,
    setToken,
    verToken
}

