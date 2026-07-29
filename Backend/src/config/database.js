const mongoose = require("mongoose")


async function connectToDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing in Backend/.env")
    }

    try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Database connected successfully")
    }
    catch(err){
        console.error("Database connection failed:", err.message)
        throw err
    }
}

module.exports = connectToDB
