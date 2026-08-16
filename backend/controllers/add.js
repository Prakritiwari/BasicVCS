const fs = require("fs").promises;
const path = require("path");


async function addRepo(filePath) {

    const repoPath = path.resolve(process.cwd(), ".hidGit");
    const stagingPath = path.join(repoPath, "staging");

    try{

       await fs.mkdir(stagingPath, {recursive: true});
       const fileName = path.basename(filePath);
       await fs.copyFile(filePath, path.join(stagingPath, fileName));
       console.log(`File ${fileName} added to the staging area!`);

    }catch(err){
        console.err("Error adding file to repository: " + err);
    }
    console.log("Adding file to the repository");
}

module.exports = { addRepo };