const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello World !");
})

app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;  
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
})