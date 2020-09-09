const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

app.get('/:id', (req, res) => {
    res.json({
        message: 'cdg.sh - Short URLs for your code projects.'
    });
});

app.get('/url/:id', (req, res) => {
    res.json({
        message: 'cdg.sh - Short URLs for your code projects.'
    });
});

app.post('/', (req, res) => {
    res.json({
        message: 'cdg.sh - Short URLs for your code projects.'
    });
});

const port = process.env.PORT || 1337;

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});