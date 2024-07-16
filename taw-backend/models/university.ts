import mongoose, { Model } from 'mongoose';
import uniqueValidator = require('mongoose-unique-validator');

const UniversitySchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        index:true
    },
    city:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

UniversitySchema.plugin(uniqueValidator, { message: 'already exists' });

const University: Model<any> = mongoose.model('University', UniversitySchema);

export default University;