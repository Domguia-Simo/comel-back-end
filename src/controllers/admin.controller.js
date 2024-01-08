const adminModel = require('../models/Admin.js')
const jwt = require('jsonwebtoken')

const login=async(req ,res)=>{

    try{
        let {email ,password} = req.body
        let admin = await adminModel.findOne({email:email})
        // console.log(admin)
            if(admin == null){
                return res.status(401).json({message:'not existing email'})
            }
            if(password != admin.password){
                return res.status(401).json({message:'Invalid email or password'})
            }

            let token = jwt.sign({id:admin._id ,name:admin.name},'mytoken')
            // console.log(token)

            // admin.token = token

            return res.status(200).json({message:'login successful' ,token:token})

    }
    catch(e){
        console.log(e)
        return res.status(500).json({error:'server error'})
    }

}


const register=async(req ,res)=>{
    try{
        let {name ,email , password} = req.body
        console.log(req.body)
        const existingAdmin = await adminModel.findOne({ 'email': email });
        if (existingAdmin) {
            return res.status(409).send({ message: 'Admin Email already in use.' });
        }
            let admin = new adminModel({
                name:name,
                email:email,
                password:password
            })
            admin.save()
            .then(respond =>{
                console.log(respond)
                return res.status(200).json({message:'admin created successfully'})
            })
            .catch(err => {
                console.log(err)
                return res.status(409).json({ message: 'check you connection' });
            })
    }
    catch(e){
        console.log(e)
        return res.status(500).json({error:'server error'})
    }

}

const getAllUsers=async(req ,res)=>{
    try {
        const admins = await adminModel.find();
        return res.status(200).json({ admins: admins });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}
module.exports ={login ,register ,getAllUsers}