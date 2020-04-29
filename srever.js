const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/translate', (req, res) => {});

app.listen(3000, () => console.log('Server started at localhost:3000'));
