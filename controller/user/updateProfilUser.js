const userModel = require("../../models/userModel")


async function updateProfilUser(req,res) {

    try {
        const { email, name,phone,adress} = req.body
        const currentUser = req.userId;
        let findcurrentUser=await userModel.findById(currentUser)
            

        const payload = {
            ...req.body,
        }


        const updateUser = await userModel.findByIdAndUpdate(findcurrentUser?._id,payload)
        res.json({
            data : updateUser,
            message : "User Updated",
            success : true,
            error : false
        })
        
    } catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
    
}

module.exports=updateProfilUser