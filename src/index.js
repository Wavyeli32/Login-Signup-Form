const express = require("express");
const path = require("path");
const app = express();
const { LogInCollection, StudentCollection } = require("./mongo"); // ✅ Import both models
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define the public folder for static assets
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));



// ✅ API to fetch students from MongoDB
app.get("/students", async (req, res) => {
    try {
        const studentList = await LogInCollection.find({});
        res.json(studentList);
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ message: "An error occurred while fetching students." });
    }
});



// Routes to serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(publicPath, 'signup.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

// ✅ Login API
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Both username and password are required.' });
        }

        const user = await LogInCollection.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        return res.status(200).json({ message: 'Login successful', username: user.username, role: user.role });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// ✅ Student Dashboard API
app.get("/dashboard/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const student = await LogInCollection.findOne({ username });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const dashboardData = {
            studentName: student.name,
            mentor: { name: "Alex Mentor", expertise: "Web Development, Career Growth" },
            upcomingSessions: ["Tuesday at 3 PM", "Thursday at 5 PM"],
            goals: ["Improve coding skills", "Prepare for job interviews"],
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("❌ Error fetching student dashboard:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
});

// ✅ Mentor Dashboard API
app.get("/mentor-dashboard", async (req, res) => {
    try {
        const mentor = await LogInCollection.findOne({ role: "mentor" });

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        const dashboardData = {
            mentorName: mentor.name,
            tasks: ["Review student goals", "Prepare for next session", "Respond to mentorship requests"],
            students: [{ name: "John Doe", goal: "Improve coding skills" }, { name: "Jane Smith", goal: "Enhance public speaking" }],
            newStudentRequests: [{ name: "Michael Lee", goal: "Learn JavaScript" }, { name: "Sara Connor", goal: "Improve public speaking" }]
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("❌ Error fetching mentor dashboard:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ✅ Signup API
app.post('/signup', async (req, res) => {
    try {
        const { role, name, username, email, password, interests } = req.body;
        if (!role || !name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the username or email already exists
        const existingUser = await LogInCollection.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email is already registered.' });
        }

        // Save new user
        const newUser = new LogInCollection({ role, name, username, email, password, interests });
        await newUser.save();

        return res.status(201).json({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('❌ Sign-up error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
