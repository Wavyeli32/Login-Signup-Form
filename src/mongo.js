const mongoose = require("mongoose");

// MongoDB Atlas connection string
mongoose.connect("mongodb+srv://wavyeli32:github@cluster0.j00mf.mongodb.net/LoginFormPractice?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MongoDB Atlas connected");
    })
    .catch((e) => {
        console.error("MongoDB connection failed:", e.message);
    });

// Define Schema
const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true, // Ensures no duplicate usernames
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username must not exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"], // Alphanumeric validation
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, // Ensures no duplicate email addresses
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // Regex for email validation
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: ["student", "mentor"], // Only allow 'student' or 'mentor'
    },
    interests: {
        type: String,
        default: "", // Optional field for user interests
    },
}, { timestamps: true });

// Add a pre-save hook for password hashing
logInSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const bcrypt = require("bcrypt");
    try {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password before saving
        next();
    } catch (error) {
        next(error);
    }
});

// Create Model
const LogInCollection = mongoose.model("LogInCollection", logInSchema);

module.exports = LogInCollection;

