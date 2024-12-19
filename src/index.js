const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");
dotenv.config();
const app = express();
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const post = process.env.POST || 3001;
// db.connect();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
routes(app);

mongoose
  .connect(
    `mongodb+srv://jackmerace:${process.env.MONGO_DB}@toystore.21fum.mongodb.net/ToyStore?retryWrites=true&w=majority&appName=ToyStore`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });


app.get("/", (req, res) => {
  res.send("HELLO IN BACKEND");
});

app.listen(post, () => {
  console.log("listening on post " + post);
});
