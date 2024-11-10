const userModel = require("../../models/userModel")
const bcrypt = require('bcryptjs');

async function updatePassword(req,res) {
    try {
        const {password,newPassword,confirmPassword}=req.body
        const currentUser = req.userId;
        let findcurrentUser=await userModel.findById(currentUser)
        const checkPassword = await bcrypt.compare(password,findcurrentUser.password)
        if(!password){
            throw new Error("Please provide old password")
         }

         if(!newPassword){
            throw new Error("Please provide new Password")
         }

         if(!confirmPassword){
            throw new Error("Please provide confirm Password")
         }

        if(!checkPassword){
            throw new Error("Old password incorrect")
        }

        if(password===newPassword){
            throw new Error("This password has been used previously")
        }

        if(newPassword!==confirmPassword){
            throw new Error("Please check password and confirm password")
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(newPassword, salt);
        await userModel.findByIdAndUpdate({_id:findcurrentUser._id},{password:hashPassword})
       res.status(201).json({
        data : findcurrentUser,
        success : true,
        error : false,
        message : "Password update Successfully!"
    })
        
    } catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
    
}



module.exports=updatePassword