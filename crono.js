const express = require('express');
const { Client } = require('pg');
const cron = require('node-cron');
const debug = require('debug')('app');
const app = express();

app.use(express.json()); 
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
client.connect();
debug('One minute logger started.')

app.get('/echos', async (req, res) => {
  debug('Getting the time echos.')
  try {
    const rows = await client
    .query('SELECT echo_id, echo FROM echo_side');
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/times', async (req, res) => {
  debug('Getting the times.')
  try {
    const rows = await client
    .query('SELECT time_id, stamp FROM time_side');
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

cron.schedule('*/1 * * * *', async () => {
  await client.query('INSERT INTO time_side DEFAULT VALUES');
  console.log(`One minute of runtime logged at ${new Date}`);
});

app.listen(process.env.PORT);