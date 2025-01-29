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

// Routes to serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(publicPath, 'signup.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        console.log("Login attempt received:", { name, password });

        // Check if both fields are provided
        if (!name || !password) {
            console.log("Validation failed: Missing name or password.");
            return res.status(400).json({ message: 'Both username and password are required.' });
        }

        // Find the user by name
        const user = await LogInCollection.findOne({ name });
        if (!user) {
            console.log(`No user found with name: ${name}`);
            return res.status(401).json({ message: 'Username not found.' });
        }
        console.log("User retrieved from database:", user);

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Password mismatch for user: ${name}. Entered password: ${password}, Stored (hashed) password: ${user.password}`);
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Successful login
        console.log(`Login successful for user: ${name}`);
        return res.status(200).json({ message: 'Login successful', name: user.name, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
});


app.get('/api/student/dashboard', (req, res) => {
    // Mock student dashboard data
    const dashboardData = {
        studentName: 'John Doe',
        mentor: {
            name: 'Alex Mentor',
            expertise: ['Web Development', 'Career Growth'],
        },
        sessions: [
            { title: 'Session 1', date: 'Tuesday', time: '3 PM' },
            { title: 'Session 2', date: 'Thursday', time: '5 PM' },
        ],
        goals: ['Improve coding skills', 'Prepare for job interviews'],
    };

    res.json(dashboardData);
});


app.post('/signup', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the incoming request body

        const { role, name, username, email, password, interests } = req.body;

        // Validate input fields
        if (!role || !name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the username or email already exists
        const existingUser = await LogInCollection.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email is already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        const newUser = new LogInCollection({
            role,
            name,
            username,
            email,
            password: hashedPassword,
            interests,
        });

        await newUser.save();
        console.log('User saved:', newUser);

        // Send success response
        return res.status(201).json({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('Sign-up error:', error);

        // Handle errors
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or username is already registered.' });
        }

        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
