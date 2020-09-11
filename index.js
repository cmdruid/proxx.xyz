const express = require('express');
const monk = require('monk');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { static } = require('express');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const db = monk(process.env.MONGODB_URI);
db.then(() => { console.log('Connection success!') }).catch((e)=> { console.error('Error !', e); });

const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();
app.enable('trust proxy');
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// app.get('/', (req, res) => { return res.redirect('404'); });

app.get('/path', (req, res) => {
    return res.json({ dir: __dirname });
})

app.get('/:id', async (req, res) => {

    const { id: slug } = req.params;

    if (!slug) return res.json(req.params);

    const url = await urls.findOne({ slug });

    if (!url) return res.status(404).redirect('404');
    
    return res.redirect(url.url);
});

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
})

app.post('/url', slowDown({
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
}), rateLimit({
    windowMs: 30 * 1000,
    max: 1
}), async (req, res, next) => {
    let { slug, url } = req.body;
    
    try {
        // Validate data first.
        await schema.validate({ slug, url });


        if (url.includes('proxx.xyz')) throw new Error('Stop it :stop:');
        // If no slug specified, generate one.
        if (!slug) slug = nanoid(5);
    
        // Make sure slug is converted to all lowercase.
        slug = slug.toLowerCase();

        const existing = await urls.findOne({ slug });
        if (existing) throw new Error('Slug in use! Try again!');

        const newUrl = { url, slug };
        const created = await urls.insert(newUrl);

        // Return data.
        res.json(created);

    } catch (err) { next(err); };
});


// Error Handler
app.use((err, req, res, next) => {
    if (err.status) { res.status(err.status); } else { res.status(500); }
    res.json({ message: err.message, stack: err.stack });
});


const port = process.env.PORT || 1337;

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});