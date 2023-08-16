const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8080;
const app = express();
const cors = require("cors")


app.use(cors());
const router = require('./Routes/route')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URL + process.env.MONGODB_NAME)

  .then((response) => {
    console.log("connected to mongod DB successfully!");
  })
  .catch((err) => {
    console.log("connection to DB failed", err);
  });

app.use('/api',router)

app.use((req, res) => {
  res.send("it is working");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
