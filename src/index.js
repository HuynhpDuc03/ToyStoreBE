const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const cors = require('cors');
dotenv.config()
const app = express();
const routes = require('./routes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const post = process.env.POST || 3001;
db.connect();

app.use(cors())
app.use(bodyParser.json());
app.use(cookieParser()); 
routes(app);


app.get('/', (req, res) => {
    res.send('HELLO IN BACKEND');
});

app.listen(post, () => {
    console.log('listening on post ' + post);
});

