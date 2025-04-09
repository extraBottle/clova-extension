const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 443;
app.listen(PORT, () => console.log('Clova server running...'));