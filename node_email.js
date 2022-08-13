
module.exports = app => {
    const { paramAll } = require('./public/Common');

    const nodemailer = require('nodemailer')
    const smtpTransport = require('nodemailer-smtp-transport')

    const assert = require('http-assert')

    const transport = nodemailer.createTransport(smtpTransport({
        service: 'qq',
        secure: true,
        auth: {
            user: '1846115663@qq.com',
            pass: 'lqvvhssyfvmfbcdh'
        }
    }));

    const randomFns = () => { // 生成6位随机数
        return Math.floor(Math.random() * 1000000)
    }
    let regEmail =  /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
    //验证邮箱正则
    return async (req, res, next) => {
        let { email } = paramAll(req);
        console.log(req.query);

        // console.log(regEmail.test(email));
        if (regEmail.test(email)) {
            
            let code = randomFns()
            transport.sendMail({
                from: '1846115663@qq.com', // 发件邮箱
                to: email, // 收件列表
                subject: '验证你的电子邮件', // 标题
                html: `
            <p>你好！</p>
            <p>您正在注册社区账号</p>
            <p>你的验证码是：<strong style="color: #ff4e2a;">${code}</strong></p>
            <p>***该验证码5分钟内有效***</p>` // html 内容
            },
                function (error, data) {
                    assert(!error, 500, "发送验证码错误！")
                    transport.close(); // 如果没用，关闭连接池
                })
            const codeModel = require('./mongo/mongo_connect').codeModel

            await codeModel.deleteMany({ email })
            const [data] = await codeModel.insertMany({ email, code })
            setTimeout(async () => {    //5分钟后失效
                await codeModel.deleteMany({ email })
            }, 1000 * 60 * 5)
        } else {
            assert(false, 422, '请输入正确的邮箱格式！')
        }
        next()
    }
}

/*

*/