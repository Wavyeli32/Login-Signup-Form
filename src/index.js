const express = require("express");
const path = require("path");
const app = express();
const { LogInCollection} = require("./mongo"); 
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define the public folder for static assets
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
const publicImagesPath = path.join(__dirname, "../public/images");
app.use('/images', express.static(publicImagesPath));




app.get("/students", async (req, res) => {
    try {
        const studentList = await LogInCollection.find({ role: "student" }).select('name interests profileImage');
        res.json(studentList);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "An error occurred while fetching students." });
    }
});

app.post("/mentor/select-student", async (req, res) => {
    try {
        const { studentId } = req.body;
        const mentor = await LogInCollection.findOne({ role: "mentor" });

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found." });
        }

        // Find student and update mentor field
        const student = await LogInCollection.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Assign student to the mentor
        student.mentor = mentor._id;
        await student.save();

        // Add student to mentor's list
        mentor.students.push(student._id);
        await mentor.save();

        res.json({ message: "Student added successfully!" });
    } catch (error) {
        console.error("Error selecting student:", error);
        res.status(500).json({ message: "An error occurred." });
    }
});


// Routes to serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(publicPath, 'signup.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

// Forgot Password API
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required to reset your password.' });
        }

        // Check if the email exists in the database
        const user = await LogInCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }

        // Here, you would implement a password reset process, such as sending a reset link to the user's email.
        // For now, let's simulate that process:
        console.log(`Password reset link sent to: ${email}`);

        res.status(200).json({ message: 'A password reset link has been sent to your email.' });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Login API
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

        // Assuming `user.name` holds the student's full name
        return res.status(200).json({
            message: 'Login successful',
            username: user.username,
            role: user.role,
            studentName: user.name // Send the student's name here
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});


app.get("/dashboard/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const student = await LogInCollection.findOne({ username });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const mentor = await LogInCollection.findById(student.mentor);  // Fetch mentor from the database
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        const dashboardData = {
            studentName: student.name,
            mentor: {
                name: mentor.name,
                expertise: mentor.expertise || "Not available" // Assuming mentor has expertise field
            },
            upcomingSessions: ["Tuesday at 3 PM", "Thursday at 5 PM"],
            goals: student.goals || ["Set your goals here"]
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
});
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

app.get('/students/:id', async (req, res) => {
    try {
        const student = await LogInCollection.findById(req.params.id).lean(); // Fetch student

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Find a mentor (if any exists)
        const mentor = await LogInCollection.findOne({ role: "mentor" }).lean(); // Change criteria if needed
        student.mentor = mentor || null; // Attach mentor to student

        res.json(student);
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "Server error" });
    }
});




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

        // Save new user with the profileImage field set to null
        const newUser = new LogInCollection({
            role,
            name,
            username,
            email,
            password,
            interests,
            profileImage: "" // Adding profileImage as null initially
        });

        await newUser.save();

        return res.status(201).json({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('Sign-up error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

app.get("/students/:studentId/mentor", async (req, res) => {
    try {
        const studentId = req.params.studentId;
        
        // Check if studentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: "Invalid studentId format" });
        }

        // Fetch the student with the given ObjectId
        const student = await LogInCollection.findById(studentId).populate('mentor');
        
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        
        const mentor = student.mentor; // Assuming student has a 'mentor' field
        
        if (!mentor) {
            return res.status(404).json({ error: "Mentor not found" });
        }

        res.json({
            mentorName: mentor.name,
            mentorExpertise: mentor.expertise,
        });
    } catch (error) {
        console.error("Error fetching mentor:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
