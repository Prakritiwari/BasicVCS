const getAllUsers = (req, res) => {
    res.send("All users fetched!");
};

const signup = (req, res) => {
    res.send("Signing up!");
};

const login = (req , res) => {
    res.send("Logging in");
};

const getUserProfile = (req, res) => {
    res.send("Fetching userProfile!");
};

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