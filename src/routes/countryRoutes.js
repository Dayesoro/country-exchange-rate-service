const express = require('express');
const { refreshCountries, getAllCountries } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/', getAllCountries);

module.exports = router;
