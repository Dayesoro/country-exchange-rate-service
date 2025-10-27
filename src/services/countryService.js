const processCountries = (countriesData, exchangeRatesData) => {
    const rates = exchangeRatesData.rates;

    return countriesData.map(country => {
        let currencyCode = null;

        if (country.currencies && Array.isArray(country.currencies) && country.currencies.length > 0) { 
            currencyCode = country.currencies[0].code;
        }

        let exchangeRate = null;
        if (currencyCode && rates[currencyCode]) {
            exchangeRate = rates[currencyCode];
        }

        let estimatedGDP = null;

        if (currencyCode === null) {
            estimatedGDP = 0;
        } else if (exchangeRate === null) {
            estimatedGDP = null;
        } else {
            const multiplier = getRandomMultiplier(1000, 2000);
            estimatedGDP = (country.population * multiplier) / exchangeRate;
        }
        return {
            name: country.name,
            capital: country.capital || null,
            region: country.region || null,
            population: country.population,
            currency_code: currencyCode,
            exchange_rate: exchangeRate,
            estimated_gdp: estimatedGDP,
            flag_url: country.flag || null
        };
    });
}

const getRandomMultiplier = (min, max) => {
  return Math.random() * (max - min) + min;
}

module.exports = { processCountries };