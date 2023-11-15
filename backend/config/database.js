const mongoose = require("mongoose");
/**
 * Connects to the database.
 *
 * @return {Promise} Resolves when the database is connected.
 */
const connectDatabase = async () => {

    const connection = await mongoose.connect(process.env.DB_LOCAL_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(connection => {
        console.log(`Connected to MongoDB: ${connection.connection.host}-${connection.connection.name}-${connection.connection.port}-${process.env.NODE_ENV}`);
    });
};
module.exports = connectDatabase;