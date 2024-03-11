const jwt = require('jsonwebtoken')

const verifyAdmin =async(req ,res ,next)=>{
    try{
        console.log(req.headers)

        next()
        let token = res.headers
        
    }
    catch(e){
        console.log(e)
        return res.status(500).json({error:'server error'})
    }
}

module.exports = verifyAdmin