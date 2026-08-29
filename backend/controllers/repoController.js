const createRepository = (req, res) => {
    res.send("Repository Created!");
}

const getAllRepositories = (req, res) =>{
    res.send("All Repos fetched!");
}

const fetchRepositoryByID = (req, res) => {
    res.send("Repository fetched by ID");
}

const fetchRepositoryByName = (req, res) => {
    res.send("Repository fetched by name!");
}

const fetchRepositoryForCurrentUser = (req, res) => {
    res.send("Get Repository of current user!");
}

const updateRepositoryById = (req, res) => {
    res.send("Update current repository!");
}

const deleteRepositoryById = (req, res) => {
    res.send("Deleting repository!");
}

const toggleVisibilityByID = (req, res) => {
    res.send("Change Visibility");
}

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryByID,
    fetchRepositoryByName,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityByID,
    fetchRepositoryForCurrentUser

}