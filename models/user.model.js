import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب'],
        unique: true,
        trim: true,
        minlength: [7, 'رقم الهاتف قصير جداً (الحد الأدنى 7 أحرف/أرقام)'],
        maxlength: [20, 'رقم الهاتف طويل جداً (الحد الأقصى 20 أحرف/أرقام)']
        
    },
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة'],
        minlength: [6, 'كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام']
    },
    role: {
        type: String,
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    refreshToken:{
      type: String,
      sparse: true,
      required: false 
    }
}, {
    timestamps: true
});
// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
// compare password and hashedPassword
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

const User = mongoose.model("User", userSchema);
export default User;
