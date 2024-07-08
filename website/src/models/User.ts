import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image : {
        type: String,
        default: "https://github.com/shadcn.png"
    },
    github_id: {
        type: Number,
        default : 0
    },
    github_url: {
        type: String,
        required: true,
        unique: true
    },
    github_username: {
        type: String,
        required: true
    }
});

const User = mongoose.models.User ||  mongoose.model("User", UserSchema);

export default User;