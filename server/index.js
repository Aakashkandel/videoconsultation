import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const generateSessionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

app.post("/getSignature", (req, res) => {
  try {
    const { sessionName, userName, sessionPasscode, userRole } = req.body;

    if (!sessionName || !userName || !sessionPasscode || !userRole) {
      return res.status(400).json({ error: "Missing sessionName, userName, sessionPasscode or userRole" });
    }

    if (!process.env.VIDEOSDK_API_KEY || !process.env.VIDEOSDK_SECRET_KEY) {
      throw new Error("Missing VIDEOSDK_API_KEY or VIDEOSDK_SECRET_KEY in environment");
    }

    const role = userRole === 'doctor' ? 1 : 0;
    const permissions = role === 1 ? ["allow_join", "allow_mod"] : ["allow_join"];

    const payload = {
      apikey: process.env.VIDEOSDK_API_KEY,
      permissions: permissions,
      role: role,
      iat: Math.floor(Date.now() / 1000) - 30,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };

    const VIDEO_SDK_JWT = jwt.sign(payload, process.env.VIDEOSDK_SECRET_KEY, {
      algorithm: "HS256",
    });

    const sessionCode = generateSessionCode();

    const meetingData = {
      session_name: sessionName,
      signature: VIDEO_SDK_JWT,
      user_name: userName,
      session_passcode: sessionPasscode,
      role: role,
      session_code: sessionCode,
    };

    return res.json(meetingData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VideoSDK Token Server running on port ${PORT}`));
