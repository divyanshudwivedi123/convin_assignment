const express = require("express");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;


app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World !");
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
})