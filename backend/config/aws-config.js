const path = require("path");

// Load backend/.env regardless of the folder the CLI was launched from.
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION || "ap-south-1" });

const s3 = new AWS.S3();
const S3_BUCKET = process.env.S3_BUCKET || "basicvcsbucket";

module.exports = { s3, S3_BUCKET };
