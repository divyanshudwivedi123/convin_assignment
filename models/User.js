const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        minlength: 3, 
        maxlength: 50, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    mobile_number: { 
        type: String, 
        required: true,  
        unique: false,
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
