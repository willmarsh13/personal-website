const {MongoClient, ServerApiVersion} = require('mongodb');

// Connection string comes from the environment, never from source control.
// e.g. mongodb+srv://guestbook_app:<password>@cluster.example.net/?retryWrites=true&w=majority
const mongoURI = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'personal_site';

let client = null;
let connecting = null;

/**
 * Returns a connected Db, or null when MONGODB_URI is not configured.
 * Connection is shared and created lazily on first use.
 */
async function getDb() {
    if (!mongoURI) return null;
    if (!client) {
        client = new MongoClient(mongoURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
    }
    if (!connecting) {
        connecting = client.connect().catch((err) => {
            connecting = null; // allow a retry on the next request
            throw err;
        });
    }
    await connecting;
    return client.db(dbName);
}

module.exports = {getDb};
