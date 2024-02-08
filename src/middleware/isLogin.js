const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const isLogin = async (req, res, next) => {

    try {
        // console.log(req.headers)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Acess Denied' });
        }

        // console.log(token)
        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, email } = decoded_user_payload

        let login = await Admin.findOne({
            '_id': id,
            'email': email,
            'token': token,
        });
        if (login) {
            req.UserEmail = email;
            req.Id = id;
            next();
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } catch (err) {
        console.log(err)
        return res.status(402).json({ message: 'Acess Denied' });
    }
}

module.exports = isLogin