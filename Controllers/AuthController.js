const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");


const signup = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({
                success: false,
                message: 'User already exists, please login.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({ name, email, password: hashedPassword });

        return res.status(201).json({
            success: true,
            message: "Signup successful"
        });

    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed email or password is wrong';
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const jwtToken = jwt.sign({ email: user.email, _id: user._id },
            process.env.JWT_SECRET, { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                jwtToken,
                email,
                name: user.name
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
}

module.exports = {
    signup,
    login
}