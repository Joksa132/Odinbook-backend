const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


app.listen(4000, () => console.log("Server started on port 4000"));