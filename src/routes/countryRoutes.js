const express = require('express');
const { refreshCountries, getAllCountries, getCountryByName } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/', getAllCountries);
router.get('/:name', getCountryByName);

module.exports = router;
