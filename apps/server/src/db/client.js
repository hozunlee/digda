import { createClient } from "edgedb";

const edgeClient = createClient({
    instanceName: process.env.EDGEDB_INSTANCE,
    secretKey: process.env.EDGEDB_SECRET_KEY,
});

const a = await edgeClient.query("select 5");

console.log("a :>> ", a);
export default edgeClient;
