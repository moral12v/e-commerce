import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { PORT, APP_ENV } from './config/config.js';
import database from './config/database.js'; // Database Connection
import { api } from './src/routes/index.js';
import https from 'https';
import http from 'http';
import fs from 'fs';

// import path from 'path';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/***************
  MIDDLEWARE 
****************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(fileUpload());

app.use('/public', express.static(join(__dirname, 'public')));

app.use('/api', api);

/*********************
    SSL CERTIFICATE 
**********************/

const privateKey = fs.readFileSync('./ssl/credentials/privekey.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/credentials/cert.pem', 'utf8');
const chain = fs.readFileSync('./ssl/credentials/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: chain,
};

/***************************
   NOT FOUND HANDLER 404
****************************/
app.get('*', (req, res) => {
  res.status(404).send({ status: false, msg: 'Not Found' });
});

app.post('*', (req, res) => {
  res.status(404).send({ status: false, msg: 'Not Found' });
});

/***************************
  APPLICATION  SERVERS 
****************************/

/********************************************
    APPLICATION LISTER HTTP & HTTPS SERVERS
*********************************************/

let serverProtocol = null;

if (APP_ENV === 'production') {
  serverProtocol = https.createServer(credentials, app);
} else if (APP_ENV === 'local') {
  serverProtocol = http.createServer(app);
}

if (!serverProtocol) {
  throw new Error('Environment variables not set!');
}

serverProtocol.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} = ${APP_ENV}`);
});
