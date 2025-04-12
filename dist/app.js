import { App } from '@tinyhttp/app';
import cors from 'cors';
import { json } from 'milliparsec';
import { v4 as uuidv4 } from 'uuid';
import loadDataFromJson from './utils/loadDataFromJson.js';
import processCollection from './utils/processCollection.js';
import logger from './utils/logger.js';
const app = new App();
const PORT = Number(process.env.PORT) || 3666;
app.use(json());
// @ts-ignore
app.use(cors());
let database = loadDataFromJson() ?? {};
Object.keys(database).forEach((collection) => {
    app.get(`/${collection}`, (req, res) => {
        const { data, totalCount } = processCollection(database[collection], req);
        res.setHeader('X-Total-Count', totalCount);
        res.json(data);
    });
    app.get(`/${collection}/:id`, (req, res) => {
        const item = database[collection].find((item) => item.id.toString() === req.params.id);
        if (item) {
            res.json(item);
        }
        else {
            res.status(404).json({ error: 'No item found' });
        }
    });
    app.post(`/${collection}`, (req, res) => {
        const newItem = {
            id: req.body.id || uuidv4(),
            ...req.body,
        };
        database[collection].push(newItem);
        res.status(201).json(newItem);
    });
    app.put(`/${collection}/:id`, (req, res) => {
        const index = database[collection].findIndex((item) => item.id.toString() === req.params.id);
        if (index !== -1) {
            const updatedItem = { ...database[collection][index], ...req.body };
            database[collection][index] = updatedItem;
            res.json(updatedItem);
        }
        else {
            res.status(404).json({ error: 'No item found to update' });
        }
    });
    app.patch(`/${collection}/:id`, (req, res) => {
        const index = database[collection].findIndex((item) => item.id.toString() === req.params.id);
        if (index !== -1) {
            const updatedItem = { ...database[collection][index], ...req.body };
            database[collection][index] = updatedItem;
            res.json(updatedItem);
        }
        else {
            res.status(404).json({ error: 'No item found to update' });
        }
    });
    app.delete(`/${collection}/:id`, (req, res) => {
        const index = database[collection].findIndex((item) => item.id.toString() === req.params.id);
        if (index !== -1) {
            const deletedItem = database[collection].splice(index, 1)[0];
            res.json(deletedItem);
        }
        else {
            res.status(404).json({ error: 'No item found to delete' });
        }
    });
});
app.post('/reload-database', (req, res) => {
    const SECRET = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    database = loadDataFromJson() ?? database;
    res.json({ message: 'Database reloaded successfully' });
});
app.get('/', (req, res) => {
    const endpoints = Object.keys(database)
        .map((endpoint) => `<li><a href="/${endpoint}">${endpoint}</a></li>`)
        .join('\n');
    res.send(`
    <ul>
      Available endpoints:${endpoints}
    </ul>
  `);
});
app.listen(PORT, () => {
    logger('blue', `Running on port ${PORT}`);
    logger('blue', 'Endpoints:');
    Object.keys(database).forEach((collection) => {
        logger('blue', `- /${collection}`);
    });
});
//# sourceMappingURL=app.js.map