const User = require('../../models/userSchema');

const generateOtp = require('../../utils/otp/generateOtp');
const sendOtp = require('../../utils/otp/sendOtp');

const otp = async (req, res) => {
    console.log("Helllo");
    const { phoneNumber } = req.body;
    console.log("phoneNumber:", phoneNumber);
    if (!phoneNumber) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
    try {
        const userExist = await User.findOne({ phoneNumber });
        if (!userExist) {
            return res.status(422).json({ error: "Invalid OTP" });
        }
        const otp = generateOtp();
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
        userExist.otp = otp;
        userExist.otpExpiration = otpExpiration;
        await userExist.save();
        //send otp using twillo or any other service
        await sendOtp(phoneNumber, otp);
        res.status(201).json({ message: "Otp sent Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const verifyOtp = async (req, res) => {
    console.log("verifyOtp");
    const { phoneNumber, otp } = req.body;
   
    if (!phoneNumber || !otp) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
     
    try {
        const userExist = await User.findOne({ phoneNumber: phoneNumber, otp: otp, otpExpiration: { $gt: Date.now() } });
        console.log(userExist);
        if (!userExist) {
            return res.status(422).json({ error: "Invalid OTP" });
        }
        const token = await userExist.generateAuthToken(req, res);
        console.log(token + "-------");
        // res.setHeader('Set-Cookie', `token=${token};`);
        //  res.setHeader('Set-Cookie', `token=${token}; Path=/; Expires=Thu, 31 Dec 9999 23:59:59 GMT;`);
        res.cookie("token", token, {
            expires: new Date('9999-12-31T23:59:59Z'),
            httpOnly: true,
            // signed:true
            sameSite:"none",
            secure: true,
        });
        
        res.status(200).json({
            success: true,
            token,
        });

    //      res
    // .writeHead(201, {
    //   "Set-Cookie": `token=${token}; Expires=Thu, 31 Dec 9999 23:59:59 GMT;`,
    //   "Access-Control-Allow-Credentials": "true"
    // })
    // .send();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {otp,verifyOtp};