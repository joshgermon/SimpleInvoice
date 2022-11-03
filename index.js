import express from 'express';
import bodyParser from 'body-parser';
import { createInvoice } from './invoice-pdf.js'; 

const app = express();

app.use(express.json())

app.get("/", (req, res) => {
    res.send('Hello world')
})

app.post("/invoice", (req, res) => {
    createInvoice(req, res);
})

app.listen(3300);