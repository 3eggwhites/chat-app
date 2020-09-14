const express = require('express');
const path = require('path');

const port = process.env.PORT;

const app = express();

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.use('/', async (req,res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`App is up on port ${port}`);
});