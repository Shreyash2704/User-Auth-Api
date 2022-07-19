const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer =  require('multer');
const mongoose = require('mongoose');
const AuthROute = require('./routes/Auth')
const app = express();
const path = require('path')


//------middlewares--------------------------
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT")
    res.header("Access-Control-Allow-Headers","x-requested-with, Content-Type, origin, authorization, accept, client-security-token")
    next()
})
app.use('/uploads', express.static('upload/images'));
app.use('/auth',AuthROute)



//-basic routes------------------------
app.get("/uploads/:image", (req, res) => {
    const imageName = req.params['image']
    res.sendFile(path.join(__dirname, `./upload/images/${imageName}`));
  });

app.get('/',(req,res)=>{
    res.send(`Hello world!`);
})




//---database connection---------------------
const uri = 'mongodb+srv://username:password@cluster0.tzqwu.mongodb.net/database1?retryWrites=true&w=majority'
mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log(`Database Successfully connected`);
}).catch((err)=>{
    console.log(`Error connecting to database:${err}`);
})


//server setup-----------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
})
