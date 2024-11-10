const userModel = require("../../models/userModel")

async function userByMonth(req,res){
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const users = await userModel.find({
       
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
              },role: "GENERAL"
          } );

         
          res.status(200).json({
            data : users?.length,
            error : false,
            success : true,
           
        })

        
    } catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }

}

module.exports = userByMonth