const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authUser(req, res , next){
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null
    const token = req.cookies.token || bearerToken

    if(!token){
        return res.status(401).json({
            message : "Token not provided."
        })
    } 
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT_SECRET is missing in Backend/.env"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

    if(isTokenBlacklisted){
        return res.status(401).json({
            message : "Token is blacklisted. Please login again."
        })
    }


    
    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded

    next()

    } catch(err){
        return res.status(401).json({
            message :"Invalid token"
        })

    }
}
module.exports ={ authUser }
