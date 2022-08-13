let mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/slam",{keepAlive:true});
let userSchema=mongoose.Schema({
  userName:String,
  userPassword:{type:String,set(val){ 
    return require('bcryptjs').hashSync(val,10)
  }},
  email:String,
  addTime:Date,
  alive:String
})



let codeSchema=mongoose.Schema({
  email:String,
  code:Number
})

let db=mongoose.connections[0];
db.on('error', console.error.bind(console, 'connection error:'));




db.once('open', function() {
  console.log("we're connected!")


});
let userModel=db.model('user',userSchema);
let codeModel=db.model('code',codeSchema);
module.exports={
  userModel,
  codeModel
}
