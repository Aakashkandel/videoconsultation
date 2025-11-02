import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import KJUR from 'jsrsasign';

dotenv.config();

const app = express();

// Enable SharedArrayBuffer for Zoom Video SDK
// These headers are required for 720p WebAssembly video, background noise suppression, and virtual backgrounds
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());
app.use(cors());

app.post("/getSignature", (req, res) => {
  try {
    const { sessionName, userName, sessionPasscode, userRole } = req.body;
    console.log("this is the data from frontend",sessionName,userName,sessionPasscode,userRole)

    if (!sessionName || !userName || !sessionPasscode || !userRole) {
      return res.status(400).json({ error: "Missing sessionName, userName, sessionPasscode or userRole" });
    }

    if (!process.env.VIDEOSDK_SDK_KEY || !process.env.VIDEOSDK_SECRET_KEY) {
      throw new Error("Missing VIDEOSDK_SDK_KEY or VIDEOSDK_SECRET_KEY in environment");
    }

    const role = userRole === 'doctor' ? 1 : 0;

    const permissions = role === 1 ? ["allow_join", "allow_mod"] : ["allow_join"];

    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
      app_key: process.env.VIDEOSDK_SDK_KEY,
      tpc: sessionName,
      role_type: role,
      version: 1,
      iat: Math.floor(Date.now() / 1000) - 30,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const VIDEO_SDK_JWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.VIDEOSDK_SECRET_KEY)

    const meetingData = {
      session_name: sessionName,
      signature: VIDEO_SDK_JWT,
      user_name: userName,
      session_passcode: sessionPasscode,
      role: role,
    };

    return res.json(meetingData);
  } catch (error) {
    console.error("Error generating VideoSDK signature:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VideoSDK Token Server running on port ${PORT}`));
