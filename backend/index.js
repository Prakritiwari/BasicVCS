const yargs  = require("yargs");
const { hideBin } = require("yargs/helpers");

const {initRepo} = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const {pushRepo } = require("./controllers/push");
const {pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

yargs(hideBin(process.argv))
.command("init", "Initialse a new repository", {} , initRepo)
.command("add <file>", "Add file to the repository", (yargs) => {
    yargs.positional("file",{
        describe: "File to add to the string area", 
        type : "string",

    } );
}, (argv) => {
    addRepo(argv.file);
}
)
.command("commit <message>", "Commit changes of the file", (yargs) => {
    yargs.positional("message",{
        describe: "File to add to the string area", 
        type : "string",

    } );
}, (argv) => {
    commitRepo(argv.message);
}
) 
.command("push" , "Push the file to repository", {}, pushRepo)
.command("pull", "Pull the file from repository", {}, pullRepo)
.command("revert <commitID>", "Revert to a specific commit", (yargs) => {
    yargs.positional("commitID",{
        describe: "Commit ID to revert to", 
        type : "string",

    } );
}, (argv) => {
    revertRepo(argv.commitID);
}
) 
.demandCommand(1, "You need atleast one command")
.help().argv;