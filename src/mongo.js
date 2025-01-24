const mongoose = require("mongoose");

// MongoDB Atlas connection string
mongoose.connect("mongodb+srv://wavyeli32:github@cluster0.j00mf.mongodb.net/", {
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
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate email addresses
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "mentor"], // Only allow 'student' or 'mentor'
    },
    interests: {
        type: String,
        default: "", // Optional field for user interests
    },
}, { timestamps: true });

// Create Model
const LogInCollection = mongoose.model("LogInCollection", logInSchema);

module.exports = LogInCollection;
