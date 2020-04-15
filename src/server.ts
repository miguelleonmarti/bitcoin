import express from "express";
import router from "./routes/routes";
const app = express();

let PORT: string | number;
if (process.env.PORT) PORT = process.env.PORT;
else PORT = process.argv[2];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(PORT, () =>
  console.log(`Server is listening on http://localhost:${PORT}`)
);
