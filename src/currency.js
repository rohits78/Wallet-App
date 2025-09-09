import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function convertCurrency(amount, from = 'INR', to = 'USD') {
  const url = `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}&currencies=${to}&base_currency=${from}`;
  const response = await axios.get(url);
  const rate = response.data.data[to].value;
  return parseFloat((amount * rate).toFixed(2));
}
