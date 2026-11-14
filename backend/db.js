const mongoose = require("mongoose");

const cache =
    global.__basicvcsMongoose ||
    (global.__basicvcsMongoose = { conn: null, promise: null });

async function connectDB() {
    if (cache.conn) return cache.conn;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is missing.");
    }

    if (!cache.promise) {
        cache.promise = mongoose
            .connect(uri, { bufferCommands: false })
            .then((instance) => {
                cache.conn = instance;
                console.log("MongoDB Connection created!");
                return instance;
            })
            .catch((err) => {
                cache.promise = null;
                throw err;
            });
    }

    cache.conn = await cache.promise;
    return cache.conn;
}

module.exports = { connectDB };
