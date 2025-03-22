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
        unique: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username must not exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: ["student", "mentor"],
    },
    interests: {
        type: String,
        default: "",
    },
    profileImage: {
        type: String,
        default: "https://via.placeholder.com/150"
    }
}, { timestamps: true });


const LogInCollection = mongoose.model("LogInCollection", logInSchema);

module.exports = { LogInCollection};
