const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");



const yargs  = require("yargs");
const { hideBin } = require("yargs/helpers");

const {initRepo} = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const {pushRepo } = require("./controllers/push");
const {pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");


dotenv.config();
yargs(hideBin(process.argv))
.command("start", "Starting the server", {} , startServer)
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


function startServer(){
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());
    const mongoURI = process.env.MONGODB_URI;
    
    mongoose.connect(mongoURI).then(() => console.log("MongoDB Connection created!")).catch((err) => console.error("Error in connection: " + err));
    console.log("Starting the server");

    app.use(cors({origin:"*"}));
    app.use("/", mainRouter);
    
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
         cors: { origin: "*",
        method: ["GET", "POST"],
    }
    });

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log("=====");
            console.log(user);
            console.log("=====");
            socket.join(userID);
        });
    } );

    const db = mongoose.connection;
    db.once("open", async() => {
        console.log("CRUD operations called!");
    });

    httpServer.listen(port, () => {
        console.log(`The server is running on PORT: ${port}`)
    })
}