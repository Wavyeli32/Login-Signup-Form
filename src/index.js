const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const app = express();
const LogInCollection = require("./mongo");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define the public folder for static assets
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Dummy student data (Replace with database query)
const students = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Michael Lee" },
    { id: 4, name: "Sara Connor" }
];

// API to get students
app.get("/api/students", (req, res) => {
    res.json(students);
});

// API to handle donations
app.post("/api/donate", (req, res) => {
    console.log("Donation received:", req.body);
    res.json({ message: "Donation successful!" });
});


// Routes to serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(publicPath, 'signup.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Login attempt received:", { username, password });

        if (!username || !password) {
            console.log("Validation failed: Missing username or password.");
            return res.status(400).json({ message: 'Both username and password are required.' });
        }

        const user = await LogInCollection.findOne({ username });
        if (!user) {
            console.log(`No user found with username: ${username}`);
            return res.status(401).json({ message: 'Username not found.' });
        }
        console.log("User retrieved from database:", user);

        // **✅ Directly compare passwords (since they are stored in plain text)**
        if (user.password !== password) {
            console.log(`Password mismatch for user: ${username}`);
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        console.log(`✅ Login successful for user: ${username}`);
        return res.status(200).json({ message: 'Login successful', username: user.username, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
});

app.get("/dashboard/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const student = await LogInCollection.findOne({ username });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Mock mentorship data (Replace with real DB data if needed)
        const dashboardData = {
            studentName: student.name,
            mentor: { name: "Alex Mentor", expertise: "Web Development, Career Growth" },
            upcomingSessions: ["Tuesday at 3 PM", "Thursday at 5 PM"],
            goals: ["Improve coding skills", "Prepare for job interviews"],
        };

        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



app.post('/signup', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { role, name, username, email, password, interests } = req.body;

        if (!role || !name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the username or email already exists
        const existingUser = await LogInCollection.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email is already registered.' });
        }

        // **❌ Remove bcrypt.hash() so passwords are stored as plain text**
        const newUser = new LogInCollection({
            role,
            name,
            username,
            email,
            password, // ✅ Store password directly
            interests,
        });

        await newUser.save();
        console.log('User saved:', newUser);

        return res.status(201).json({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('Sign-up error:', error);

        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or username is already registered.' });
        }

        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

app.get("/mentor-dashboard", async (req, res) => {
    try {
        const mentor = await LogInCollection.findOne({ role: "mentor" });

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        // Mock data (Replace with DB queries)
        const dashboardData = {
            mentorName: mentor.name,
            tasks: [
                "Review student goals",
                "Prepare for next session",
                "Respond to mentorship requests"
            ],
            students: [
                { name: "John Doe", goal: "Improve coding skills" },
                { name: "Jane Smith", goal: "Enhance public speaking" }
            ],
            newStudentRequests: [
                { name: "Michael Lee", goal: "Learn JavaScript" },
                { name: "Sara Connor", goal: "Improve public speaking" }
            ]
        };

        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
