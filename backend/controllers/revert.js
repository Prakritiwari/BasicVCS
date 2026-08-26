const fs = require("fs");
const { kMaxLength } = require("buffer");
const path = require("path");
const { promisify } = require("util");

const readdir =  promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);


async function revertRepo(commitID) {

    const repoPath = path.resolve(process.cwd(), ".hidGit");
    const commitPath = path.join(repoPath, "commits");

    try{
      const commitDir = path.join(commitPath, commitID);
      const files = await readdir(commitDir);
      const parentDir = path.join(repoPath, "..");

      for(const file of files){
        await copyFile(path.join(commitDir, file), path.join(parentDir, file));
      }

      console.log(`Commited to ${commitID} successfully!`);

    }catch(err){
        console.error("Unable to revert: " + err);
    }
    console.log("Reverting to the given commit");
}

module.exports = {revertRepo};