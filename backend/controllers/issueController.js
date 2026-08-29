const createIssue = async(req, res) => {
    res.send("Creating Issue");
}

const updateIssue = async(req, res) => {
    res.send("updating Issue");
}

const deleteIssue = async(req, res) => {
    res.send("deleting Issue");
}

const getAllIssue = async(req, res) => {
    res.send("get All Issue");
}

const getIssueById = async(req, res) => {
    res.send("get Issue by ID");
}


module.exports = {
    createIssue,
    deleteIssue,
    updateIssue,
    getAllIssue, 
    getIssueById
}