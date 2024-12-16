const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Database Connection
dotenv.config();
// console.log("Connecting to:", process.env.MONGO_URL);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    // console.log("MongoDB connected successfully");
  } catch (err) {
    // console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  }
};

connectDB(); // Call the connection function

const jwtSecret = process.env.JWT_SECRET;

// Hashing the password from Database
const bcryptSalt = bcrypt.genSaltSync(10);

const upload = multer({ dest: path.join(__dirname, "uploads") });

const app = express();
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

// Function to read the logged in user's token
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

// Testing the Route
app.get("/test", (req, res) => {
  res.json("test ok");
});

// Message Route
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// People Route
app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

// Profile Route
app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

// File Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  const userData = await getUserDataFromRequest(req);
  const { recipient, text } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File not provided" });
  }

  // Extract the file extension from the original file name
  const ext = path.extname(req.file.originalname);
  const filename = req.file.filename + ext;

  // Rename the file with its correct extension
  const tempPath = path.join(__dirname, "uploads", req.file.filename);
  const finalPath = path.join(__dirname, "uploads", filename);
  fs.rename(tempPath, finalPath, (err) => {
    if (err) {
      console.error("Error renaming file:", err);
      return res.status(500).json({ error: "Error saving file" });
    }
  });

  const message = await Message.create({
    sender: userData.userId,
    recipient,
    text: text || "",
    file: filename, // Save the uploaded file's name
  });

  // Broadcast the file message to the recipient
  [...wss.clients]
    .filter((c) => c.userId === recipient && c.userId === userData.userId)
    .forEach((c) => {
      c.send(
        JSON.stringify({
          _id: message._id,
          sender: userData.userId,
          recipient,
          text: message.text,
          file: message.file,
          createdAt: message.createdAt,
        })
      );
    });

  res.json(message);
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        { expiresIn: "1h" }, // Token expires in 1 hour
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    } else {
      res.status(401).json({ error: "Wrong credentials" });
    }
  } else {
    res.status(401).json({ error: "User not found" });
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  res
    .cookie("token", "", {
      sameSite: "none",
      secure: true,
      httpOnly: true, // Add for better security
      expires: new Date(0), // Expire the cookie immediately
    })
    .json("ok");
});

// Registration Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });

    // Generate JWT token
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          return res.status(500).json("Error Generating Token");
        }
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json("Error creating user");
  }
});

const server = app.listen(4000);

// Save Online users Data
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  // Notify everyone about online people (when someone connects)
  function notifyAboutOnlinePeople() {
    // [...wss.clients].forEach((client) => {
    //   client.send(
    //     JSON.stringify({
    //       online: [...wss.clients].map((c) => ({
    //         userId: c.userId,
    //         username: c.username,
    //       })),
    //     })
    //   );
    // });
    const onlineUsers = [...wss.clients]
      .filter((client) => client.isAlive)
      .map((client) => ({ userId: client.userId, username: client.username }));

    [...wss.clients].forEach((client) => {
      client.send(JSON.stringify({ online: onlineUsers }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // user is removed from the online list when the connection is terminated
  connection.on("close", () => {
    connection.isAlive = false;
    clearInterval(connection.timer);
    notifyAboutOnlinePeople();
  });

  // Read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  // Send & Recieve Messages and Store to the DB
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      console.log("size", file.data.length);
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const filePath = path.join(__dirname + "uploads" + filename);
      const bufferData = Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(filePath, bufferData, () => {
        console.log("file saved:" + path);
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      // console.log("created message");
      // Broadcast the message only to the recipient and sender
      [...wss.clients]
        .filter(
          (c) => c.userId === recipient && c.userId === messageData.userId
        )
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messageDoc._id,
            })
          )
        );
      // Optionally, send the message to the sender (to show in their own chat)
      connection.send(
        JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          file: file ? filename : null,
          _id: messageDoc._id,
        })
      );
    }
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});
