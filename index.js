const express = require("express");
const mongoose = require("mongoose");
const Auth = require("./routes/auth");
const Notes = require("./routes/notes");
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors())


require("dotenv").config();

mongoose.connect(process.env.DATABASE_URI);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use("/auth", Auth);
app.use("/notes", Notes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);
