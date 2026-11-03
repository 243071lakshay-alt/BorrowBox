const mongoose=require('mongoose')
const express=require('express')
const connectDB=async()=>{
    try{
        const mongoURL=process.env.Mongo_url;
        if(!mongoURL)
        {
            throw new Error("MongoDB url not found")
        }
        console.log("connecting to MongoDB")
        await mongoose.connect(mongoURL)
    }catch(error)
    {
        console.log("MongoDB connection error",error.message)
        throw error;
    }
}
module.exports=connectDB;