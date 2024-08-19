/*
* One city can have multiple universities
*
* Look at this article to understand one-to-many relationships in mongodb
* https://medium.com/@brandon.lau86/one-to-many-relationships-with-mongodb-and-mongoose-in-node-express-d5c9d23d93c2
* */

import mongoose, { Model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import University from "./university";


const CitySchema = new mongoose.Schema({
    name:{
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        index:true
    },
    province:{
        type: String,
        required: [true, "can't be blank"]
    },
    country:{
        type: String,
        required: [true, "can't be blank"]
    },
 /*   universities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: University
    }] */
});

CitySchema.plugin(uniqueValidator, { message: 'already exists' });
CitySchema.index({ "$**": "text" });
const City: Model<any> = mongoose.model('City', CitySchema);

export default City;