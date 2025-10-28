const express = require('express');
const { refreshCountries } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);

module.exports = router;
