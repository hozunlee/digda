import { createClient } from "edgedb";
import "dotenv/config";
// const edgeClient = createClient({
//     dns: process.env.EDGEDB_CONNECTION_STRING,
//     tlsSecurity: "strict",
// });

const edgeClient = createClient({
    instanceName: process.env.EDGEDB_INSTANCE_NAME,
    secretKey: process.env.EDGEDB_SECRET_KEY,
    tlsSecurity: "strict",
});

export default edgeClient;
