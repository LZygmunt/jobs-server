import { App, type Request, type Response } from '@tinyhttp/app';
import cors from 'cors';
import { json } from 'milliparsec';
import { v4 as uuidv4 } from 'uuid';
import loadDataFromJson from './utils/loadDataFromJson.js';
import processCollection from './utils/processCollection.js';
import type { Database, DatabaseItem } from './types.js';
import logger from './utils/logger.js';

const app = new App()
const PORT: number = Number(process.env.PORT) || 3666

app.use(json())
// @ts-ignore
app.use(cors())

let database: Database = loadDataFromJson() ?? {};

Object.keys(database).forEach((collection) => {
  app.get(`/${collection}`, (req: Request, res: Response) => {
    const { data, totalCount } = processCollection(database[collection], req)
    res.setHeader('X-Total-Count', totalCount)
    res.json(data)
  })

  app.get(`/${collection}/:id`, (req: Request, res: Response) => {
    const item = database[collection].find((item) => item.id.toString() === req.params.id)
    if (item) {
      res.json(item)
    } else {
      res.status(404).json({ error: 'No item found' })
    }
  })

  app.post(`/${collection}`, (req: Request, res: Response) => {
    const newItem: DatabaseItem = {
      id: req.body.id || uuidv4(),
      ...req.body,
    }
    database[collection].push(newItem)
    res.status(201).json(newItem)
  })

  app.put(`/${collection}/:id`, (req: Request, res: Response) => {
    const index = database[collection].findIndex((item) => item.id.toString() === req.params.id)
    if (index !== -1) {
      const updatedItem = { ...database[collection][index], ...req.body }
      database[collection][index] = updatedItem
      res.json(updatedItem)
    } else {
      res.status(404).json({ error: 'No item found to update' })
    }
  })

  app.patch(`/${collection}/:id`, (req: Request, res: Response) => {
    const index = database[collection].findIndex((item) => item.id.toString() === req.params.id)
    if (index !== -1) {
      const updatedItem = { ...database[collection][index], ...req.body }
      database[collection][index] = updatedItem
      res.json(updatedItem)
    } else {
      res.status(404).json({ error: 'No item found to update' })
    }
  })

  app.delete(`/${collection}/:id`, (req: Request, res: Response) => {
    const index = database[collection].findIndex((item) => item.id.toString() === req.params.id)
    if (index !== -1) {
      const deletedItem = database[collection].splice(index, 1)[0]
      res.json(deletedItem)
    } else {
      res.status(404).json({ error: 'No item found to delete' })
    }
  })
})

app.post('/reload-database', (req: Request, res: Response) => {
  const SECRET = process.env.CRON_SECRET ?? '';
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (token !== SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  database = loadDataFromJson() ?? database
  res.json({ message: 'Database reloaded successfully' })
})

app.listen(PORT, () => {
  logger('blue', `Running on port ${PORT}`);
  logger('blue', 'Endpoints:')
  Object.keys(database).forEach((collection) => {
    logger('blue', `- /${collection}`)
  })
})
