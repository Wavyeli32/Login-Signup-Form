const express = require("express");
const path = require("path");
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

// Signup route
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    };

    try {
        const checking = await LogInCollection.findOne({ name: req.body.name });

        if (checking && checking.name === req.body.name && checking.password === req.body.password) {
            res.send("User details already exist");
        } else {
            await LogInCollection.insertMany([data]);
            res.redirect('/'); // Redirect to login page after signup
        }
    } catch {
        res.send("Error during signup, please try again");
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });

        if (check && check.password === req.body.password) {
            res.sendFile(path.join(publicPath, 'home.html'));
        } else {
            res.send("Incorrect username or password");
        }
    } catch (e) {
        res.send("Wrong details");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
