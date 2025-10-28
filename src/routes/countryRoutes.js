const express = require('express');
const { refreshCountries, getAllCountries, getCountryByName, getStatus } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/', getAllCountries);
router.get('/status', getStatus);
router.get('/:name', getCountryByName);

module.exports = router;
