import { createClient } from "edgedb";

// const edgeClient = createClient({
//     dns: process.env.EDGEDB_CONNECTION_STRING,
//     tlsSecurity: "strict",
// });

const edgeClient = createClient({
    instanceName: process.env.EDGEDB_INSTANCE_NAME,
    secretKey: process.env.EDGEDB_SECRET_KEY,
    tlsSecurity: "strict",
});

// const a = await edgeClient.query(`
//     SELECT Movie{
//     title
//     } ;
//     `);

// const b = await edgeClient.querySingle(`select 1 + 1`);

// console.log("a :>> ", a, b);
export default edgeClient;
