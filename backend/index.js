require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FormDataModel = require('./models/FormData'); // Path to your model

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await FormDataModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new FormDataModel({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        console.log("Received email:", trimmedEmail, typeof trimmedEmail);
        console.log("Received password:", trimmedPassword, typeof trimmedPassword);

        const user = await FormDataModel.findOne({ email: trimmedEmail });
        console.log("User found:", user);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials - User not found' });
        }

        console.log("Stored Hashed Password:", user.password, typeof user.password);

        const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
        console.log("Password match:", passwordMatch);

        // Direct bcrypt comparison test (use the ACTUAL password you're testing)
        if (user) {
            const directComparisonTest = await bcrypt.compare("test", user.password); // ***REPLACE "test" with the actual password***
            console.log("Direct bcrypt comparison test:", directComparisonTest);
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials - Password mismatch' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Login successful', token: token, user: user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});



// Example of a protected route (requires authentication)
app.get('/protected', (req, res) => {
    // Implement JWT verification here to protect this route
    res.json({ message: "This is a protected route" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));