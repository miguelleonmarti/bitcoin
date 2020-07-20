import express from "express";
import router from "./routes/routes";
const app = express();

let PORT: string | number;
if (process.env.PORT) PORT = process.env.PORT;
else if (process.argv[2]) PORT = process.argv[2];
else PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

const server = app.listen(PORT);

export default server;


