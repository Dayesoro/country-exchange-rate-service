const axios = require('axios');

const API_TIMEOUT = 10000;

const fetchCountries = async () => {
    try {
        const response = await axios.get(process.env.COUNTRIES_API_URL+`?fields=name,capital,region,population,flag,currencies`, {
            timeout: API_TIMEOUT,
        });
    
        return response.data;
    }
    catch (error) {
        console.error('❌ Error fetching countries:', error.message);
        throw new Error('Could not fetch data from RestCountries API');
    }
}


const fetchExchangeRates = async () => {
    try {
        const response = await axios.get(process.env.EXCHANGE_RATES_API_URL, {
            timeout: API_TIMEOUT,
        });
            return response.data;
    } catch (error) {
    console.error('❌ Error fetching exchange rates:', error.message);
        throw new Error('Could not fetch data from Exchange Rates API');
    }
}

module.exports = { fetchCountries, fetchExchangeRates };