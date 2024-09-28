


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Admin schema
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        
    },
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    password: {
        type: String,
        required: true
    }
});

// Hash the password before saving the admin to the database
// adminSchema.pre('save', async function (next) {
//     if (this.isModified('password') || this.isNew) {
//         try {
//             const salt = await bcrypt.genSalt(10);
//             this.password = await bcrypt.hash(this.password, salt);
//             next();
//         } catch (err) {
//             next(err);
//         }
//     } else {
//         next();
//     }
// });


adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare input password with the hashed password
adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};


adminSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};


// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;


