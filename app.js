
const express = require('express')
require('express-async-errors');
const { Random } = require('mockjs')
const fs = require('fs');
const app = express()
const port = 4000
const assert = require('http-assert')
const Mock = require('mockjs');
const { userModel, codeModel } = require('./mongo/mongo_connect');
const { paramAll, setToken, verToken } = require('./public/Common');
const { expressjwt } = require('express-jwt');
const bcryptjs = require('bcryptjs')
const CONFIG = require('./public/Config')
const getCode = require('./node_email')(app);
const bodyParser=require("body-parser")
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type,Authorization");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(function (req, res, next) {
  let token = req.headers['authorization'];

  if (token === undefined) {
    return next();
  } else {
    verToken(token).then((data) => {
      req.data = data;
      
      return next();
    }).catch((err) => {
      console.log(err);
      next(err)
    })
  }
})

app.use(expressjwt({
  secret: CONFIG.TOKENSECRET,
  algorithms: ['HS256']

}).unless({

  path: ['/login', '/register', '/email','/hello']
}))


app.get('/hello', (req, res) => {
  console.log(paramAll(req))
  res.send(req.query)

})

app.post('/login', (req, res) => {
  let parameter = paramAll(req);
  let { email, userPassword } = parameter;
  userModel.findOne({ email }, function (err, user) {
    if (user !== null && bcryptjs.compareSync(userPassword, user.userPassword)) {
      setToken(user.email, user._id).then((token) => {
        res.send({ success: true, token, user });
      })
    } else {
      console.log(err);
      res.send({ success: false, message: '未找到' })
    }
  })
})
app.get('/email', getCode, async (req, res) => {
  // console.log(req)
  let email = paramAll(req).email;
  res.send({ success: true, email })

}
)
app.post('/register', async function (req, res) {


  let parameter = paramAll(req);
  let { userName, userPassword, code, email } = parameter;
  let result = await codeModel.findOne({ email, code });
  // console.log(req)
  assert(result,422,'验证码出错');
  await codeModel.deleteMany({email});
  let results=await userModel.find({email});
  console.log(results);
  assert(results.length===0,422,'该电子邮箱已经注册');
  let data=await userModel.insertMany({email,userName,userPassword,addTime:(new Date())})
  res.send({success:true,data});
})
app.get('/cate', (req, res) => {
  const ret = [];
  for (let i = 0; i < 6; i++) {

    ret.push({
      'name': Random.string(5),
      'url': Random.image('100x100')
    });
  }
  res.send({
    data: ret
  })
})
/*
TODO
连接mongoose; 1
实现token+加密的认证 1

登录与注册与邮箱验证码 1
实现登录页面
实现pdf合并
实现3D模型展览
实现三维重建3D模型
实现简单的记事本
实现画图工具
*/



app.get('/classes', (req, res) => {
  const classes = [];
  for (let i = 0; i < 60; i++) {
    classes.push({
      'itemName': Random.string(5, 10),
      'image': Random.image('100X100'),


    })
  }
  res.send(classes);
})


app.get('/points', (req, res) => {
  const stream = fs.createReadStream('../after/source/response.json')

  stream.pipe(res)

})






app.get('/food', (req, res) => {
  const foods = [];
  for (let i = 0; i < 20; i++) {
    foods.push({
      'name': Random.string(5, 10),
      'cate': Random.string(5),
      'image': Random.image('100X100'),
      'date': Random.date('"yyyy-MM-dd"'),
      'introduction': Random.paragraph(2),

      'likes': Random.integer(60, 100)
    })
  }
  res.send(foods);
})
app.use(function (err, req, res, next) {
  console.log(err)
  if(err.status===401){

    return res.send({code:401,redirect:'/Login'})
  }else if(err){
    res.status(err.status).send(err.message)
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})