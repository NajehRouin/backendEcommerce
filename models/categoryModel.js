const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    label:{
        type:String,
        required:true,
        unique:true
    },
    value:{
        type:String,
        required:true,
        unique:true
    }
})


module.exports=mongoose.model('categorys',categorySchema)