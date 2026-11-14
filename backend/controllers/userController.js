const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;
let client;

dotenv.config();
const uri = process.env.MONGODB_URI;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

async function signup(req, res) {
    const { username, email, password } = req.body;
    try {
        await connectClient();
        const db = client.db("basicvcs");
        const userCollection = db.collection("users");

        const user = await userCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User Already Exists!" });

        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: [],
        }

        const result = await userCollection.insertOne(newUser);

        const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.status(201).json({
            message: "User created!",
            token,
            userId: result.insertedId,
        });

    } catch (err) {
        console.error("Unable to signup: ", err);
        res.status(500).json({ message: "Unable to signup!" });
    }

}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials!" });
        }
        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.send({ token, userId: user._id.toString() });
    } catch (err) {
        console.error("Error while logging in:", err.message);
        res.status(500).send("Internal Server Error!");
    }
}

async function cliLogin(req, res) {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30d" }
        );

        res.json({
            token,
            userId: user._id.toString(),
            username: user.username,
        });
    } catch (err) {
        console.error("Error while CLI login:", err.message);
        res.status(500).json({ message: "Could not sign in." });
    }
}

async function getAllUsers(req, res) {
    try {

        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");

        const users = await userCollection
            .find({}, { projection: { password: 0 } })
            .toArray();
        res.json(users);


    } catch (err) {
        console.error("Error while fetching all Users! ", err.message);
        res.status(500).send("Internal Server Error");
    }
}


//get a users profile
async function getUserProfile(req, res) {

    const id = req.params.id;

    try {
        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");

        const user = await userCollection.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found! " });
        }

        // Email is only visible to the account owner; everyone else gets the public profile.
        if (String(user._id) !== String(req.user?.id)) {
            delete user.email;
        }

        res.json(user);

    } catch (err) {
        console.error("Error while fetching details! ", err.message);
        res.status(500).send("Internal Server Error");
    }

}

async function updateUserProfile(req, res) {
    const id = req.params.id;
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");

        let updatedFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedFields.password = hashedPassword;
        }

        const result = await userCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updatedFields },
            { returnDocument: "after" }
        );

        // mongodb driver >= 6 returns the document directly; older versions wrap it in { value }.
        const updatedUser = result?.value ?? result;

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const { password: _password, ...user } = updatedUser;
        res.send(user);

    } catch (err) {
        console.error("Error while updating details! ", err.message);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteUserProfile(req, res) {

    const id = req.params.id;
    try {
        await connectClient();
        const db = await client.db("basicvcs");
        const userCollection = await db.collection("users");

        const result = await userCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User Profile Deleted!" });
    } catch (err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error!");
    }

}

module.exports = {
    getUserProfile,
    getAllUsers,
    signup,
    login,
    cliLogin,
    updateUserProfile,
    deleteUserProfile
}   