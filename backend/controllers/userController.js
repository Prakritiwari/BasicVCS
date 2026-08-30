const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {MongoClient} = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;
let client;

dotenv.config();
const uri = process.env.MONGODB_URI;

async function connectClient() {
    if(!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

async function signup(req, res) {
    const { username , email, password } = req.body;
    try{
        await connectClient();
        const db = client.db("basicvcs");
        const userCollection = db.collection("users");

        const user = await userCollection.findOne({username});
        if(user){
            return res.status(400).json({message: "User Already Exists!" });
    
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories : [],                      
            followedUsers: [],
            starRepos : [],
        }

        const result = await userCollection.insertOne(newUser);

        const token = jwt.sign({id:result.insertId}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
        res.json(token);

    }catch(err){
        console.error("Unable to signup: ", err);
    }

}

async function login(req,res) {
    const { email , password } = req.body;
    try{
        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({email});

        if(!user){
            return res.status(400).json({message: "Invalid credentials!"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({message: "Invalid Credentials!"});

        }
        const token = await jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
        res.send({token, userId:user._id });
    }catch(err){
        console.error("Error while logging in:" , err.message);
        res.status(500).send("Internal Server Error!");
    }
}

async function getAllUsers(req, res) {
    try{

        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");

        const users = await userCollection.find({}).toArray();
        res.json(users);

        
    }catch(err){
        console.error("Error while fetching all Users! ", err.message);
        res.status(500).send("Internal Server Error");
    }
}


//get a users profile
async function getUserProfile(req, res) {

    const id  = req.params.id;

    try{
         await connectClient();
         const db = await client.db("basicvcs");
         const userCollection = await db.collection("users");

         const user = await userCollection.findOne({
            _id : new ObjectId(id)
         });

         if(!user){
            res.status(404).json({message: "User not found! "});
         }
         res.send(user, {messge: "User profile fetched! "});

    }catch(err){
        console.error("Error while fetching details! ", err.message);
        res.status(500).send("Internal Server Error");
    }
    
}
const updateUserProfile = (req, res) => {
    res.send("Updating user Profile");
};

const deleteUserProfile = (req, res) => {
    res.send("Profile deleted!");
};

module.exports = {
    getUserProfile,
    getAllUsers,
    signup,
    login,
    updateUserProfile,
    deleteUserProfile
}   