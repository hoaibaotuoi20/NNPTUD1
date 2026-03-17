let userController = require('../controllers/users')
module.exports = {
    CheckLogin: async function (req, res, next) {
        let key = req.headers.authorization;
        if (!key) {
            if (req.cookies.LOGIN_NNPTUD_S3) {
               key =  req.cookies.LOGIN_NNPTUD_S3;
            } else {
                res.status(404).send("ban chua dang nhap")
                return;
            }

        }
        let user = await userController.GetUserById(key);
        if (!user) {
            res.status(404).send("ban chua dang nhap")
            return;
        }
        req.user = user;
        next();
    }
}