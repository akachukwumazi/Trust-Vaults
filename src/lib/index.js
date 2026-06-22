require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./Db/db");

const cookieParser = require('cookie-parser'); // NEW: Import cookie-parser

                
const cors = require("cors");
app.use(cors({
  origin: "http://127.0.0.1:5500", // allow your frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
// NEW: Add middleware for parsing URL-encoded data
// This is good practice for handling various form submissions, even if Multer handles multipart.
app.use(express.urlencoded({ extended: true }));
// NEW: Add cookie-parser middleware for handling cookies (e.g., refresh tokens)
app.use(cookieParser());


app.get("/", (req, res) => {
  console.log("Hit root route")
  res.send("API is running");
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});
console.log("API is running");
// --- Routes ---
app.use("/api/auth", authRoutes);
app.use('/api/user', userRouter);
app.use('/api/events', eventRoute); // NEW: Mount your event routes
app.use('/api/contact', contactRoute); // NEW: Mount your contact routes
app.use('/api/reviews', reviewRoute); // NEW: Mount your review routes




app.use(errorHandlerMiddleware);
const PORT = process.env.PORT || 7000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Error while connecting to the database:", err);
  }
};

start();