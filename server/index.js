import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/getSignature", (req, res) => {
  try {
    const { sessionName, userName, sessionPasscode } = req.body;
    console.log("this is the data from frontend",sessionName,userName,sessionPasscode)

    if (!sessionName || !userName || !sessionPasscode) {
      return res.status(400).json({ error: "Missing sessionName, userName or sessionPasscode" });
    }

    if (!process.env.VIDEOSDK_API_KEY || !process.env.VIDEOSDK_SECRET_KEY) {
      throw new Error("Missing VIDEOSDK_API_KEY or VIDEOSDK_SECRET_KEY in environment");
    }

    const payload = {
      apikey: process.env.VIDEOSDK_API_KEY,
      permissions: ["allow_join", "allow_mod"],
      iat: Math.floor(Date.now() / 1000) - 30,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, 
    };

    const VIDEO_SDK_JWT = jwt.sign(payload, process.env.VIDEOSDK_SECRET_KEY, {
      algorithm: "HS256",
    });

    const meetingData = {
      session_name: sessionName,
      signature: VIDEO_SDK_JWT,
      user_name: userName,
      session_passcode: sessionPasscode,
    };

    return res.json(meetingData);
  } catch (error) {
    console.error("Error generating VideoSDK signature:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VideoSDK Token Server running on port ${PORT}`));
