const router = require('express').Router()
const mongoose = require('mongoose')
const User = require('../model/User')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
const multipart = require('connect-multiparty');
const {userAuth} = require('../middleware/auth')



//__________Storage Settings__________________________________
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:function(req,file,cb){
        cb(null,`${req.user.email}-${file.originalname}`)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}

const upload = multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    },
    fileFilter : fileFilter
})

//User Exist?____________________________________________________________

const isUserExist = async(email) =>{
    const isUserExist = await User.findOne({ email: email })
    console.log(isUserExist)
    if(isUserExist !== null){
        return {res:true,data:isUserExist,message:"User already exists"}
    }else{
        return {res:false,message:"User doesn't exists"}
    }
}

//__Routes________________________________________________________________  
//________________________________________________________________________
router.get('/', function (req, res){
    res.send('Hello from auth services!')
 })
//Register_________________________________________________
router.post('/register',async function (req,res){
    
    const useremail = req.body.email
    const isuserExist = await isUserExist(useremail)
    
    if (!isuserExist.res){

        const saltPassword = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password,saltPassword)
       
        const newUser = new User({
            name : req.body.name,
            email : req.body.email,
            password  : securePassword,
            phone : req.body.phone,
            address : req.body.address,
            profile_image : null
        })
        try{
            const saveUser = await newUser.save()
            res.json({message:"User Registered",data:saveUser})
            console.log("User Saved Successfully")
        }
        catch(err){
            console.log(`${err}`)
            res.json({message:`${err}`})
        }
    }else{
        res.json({message: "User already exists"})
    }
})



//login_____________________________________________________________
router.post('/login', async function (req, res){
    const email = req.body.email
    
    const isUserExist = await User.findOne({ email: email})
    console.log(isUserExist)
    if (isUserExist !== null) {
        if(await bcrypt.compare(req.body.password, isUserExist.password)) {

            const user_id = isUserExist._id
            const email = isUserExist.email
            const token = jwt.sign({user_id,email},"shreyashsecretkey")

            res.json({ message:"User Authenticated",token:token})
        }else{
            res.json({ message:"Wrong password"})
        }
    }
    else{
        res.json({ message:"User not found"})
    }
    
})
//--------------Authentication Needed ----------------
//____________________________________________________

//profile image updation___
router.post('/profile/:email',userAuth,upload.single('profile'),async(req,res)=>{
    const email = req.params['email']
    console.log(req.file)
    console.log(req.file.filename)
    var filename = `http://localhost:5000/uploads/${req.file.filename}`
    const updateUser = await User.findOneAndUpdate({email: email},{$set:{profile_image:filename}})
    console.log(updateUser)
    res.send(updateUser)        
})


//get all data_________
router.get('/alldata',userAuth,async(req,res)=>{
    const alldata = await User.find()
    res.send({data:alldata})
    
})

//get user exist_______
router.get('/data/',userAuth,async(req,res)=>{
    res.send({data:req.user})
})

//user Update_________
router.patch('/update',userAuth,async(req,res)=>{
    const id = req.user._id
    const updatedData = await User.findByIdAndUpdate({_id:id},{$set:req.body}) 
    res.json({data:updatedData})
})

//delete all________
router.delete('/:email',async(req,res)=>{ 
    const email = req.params['email']
    const data = await User.deleteMany({email:email})
    res.json(data)
})

 module.exports = router