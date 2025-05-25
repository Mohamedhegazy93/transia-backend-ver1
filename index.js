import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import globalError from "./middlewares/error.middleware.js";
import ApiError from "./utils/apiError.js";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.route.js"; 
import userRoutes from "./routes/user.route.js"; 


const app = express();
app.use(cookieParser());
app.use(express.json());
dotenv.config();



app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/users",userRoutes);


app.all("/*splat", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);
const PORT=process.env.PORT
const server=app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB()
	
});
process.on('unhandledRejection', (err) => {
	console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
	server.close(() => {
	  console.error(`Shutting down....`);
	  process.exit(1);
	});
  });
