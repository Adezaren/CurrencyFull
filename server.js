import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = 3000;
const API_KEY = '18c80f421cf841e0ac5cb7357a6a7e21';
const API_URL = `http://data.fixer.io/api/latest?access_key=${API_KEY}`;

app.use(cors());
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/currencyDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Připojeno k databázi"))
.catch(err => console.error("chyba ve spojení s databází:", err)); 

const schema = new mongoose.Schema({
    amount: Number,
    currency: String,
    convertedAmount: Number,
    timesStep: {
        type: Date, default: Date.now 
    }
});

const Conversion = mongoose.model('Conversion', schema);

app.get('/api/currencies', async (req, res) => {
    const response = await fetch(`https://api.exchangerate.host/symbols?access_key=${API_KEY}`);
    const data = await response.json();


    if (!data.success) {
        return res.status(500).json({error: "něco se nepodařilo"});
    }

    const currencies = Object.entries(data.symbols).map(([symbol, name]) => ({
        symbol,
        name
    }));

    res.json({currencies});
});

app.get('/api/convert', async (req, res) => {
    const {amount, currency} = req.query;
    const response = await fetch(API_URL);
    const data = await response.json();
    const exchageRate = data.rates[currency];
    
    const convertedAmount = parseFloat(amount) * exchageRate;
    
    const newConversion = new Conversion({amount, currency, convertedAmount});
    await newConversion.save();

    res.json({amount: parseFloat(amount), currency, convertedAmount});
});

app.get('/api/stats', async (req, res) => {
    const conversions = await Conversion.aggregate([
        { $group: {_id: "$currency", count: {$sum: 1}}},
        {$sort: {count: -1}}
    ]);

    const totalConversions = await Conversion.countDocuments();

    res.json({conversions, totalConversions});
})

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});