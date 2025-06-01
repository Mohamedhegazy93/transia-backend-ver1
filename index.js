import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import globalError from "./middlewares/error.middleware.js";
import ApiError from "./utils/apiError.js";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.route.js"; 
import userRoutes from "./routes/user.route.js"; 
import helmet from "helmet"
import rateLimit from "express-rate-limit"; 
import cors from "cors";
import morgan from 'morgan'

connectDB()

const app = express();
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000', // لو هتشتغل في Production، لازم تحدد الـ Domains المسموح بيها
	//origin: 'https://yourfrontenddomain.com',

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204
}));
app.use(express.json());
dotenv.config();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 دقيقة
    max: 30, // 15 طلب كحد أقصى لكل IP خلال الـ 1 دقيقة
    message: "Too many requests from this IP, please try again after 1 minute!"
});

// تطبيق الـ Rate Limiter على كل الـ APIs
app.use(limiter);

// في الـ Development فقط
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // morgan لأغراض الـ logging
}

app.get('/',(req,res)=>{
	res.end('hello')
})


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
	
	
});
process.on('unhandledRejection', (err) => {
	console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
	server.close(() => {
	  console.error(`Shutting down....`);
	  process.exit(1);
	});
  });
