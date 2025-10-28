const { generateSummaryImage } = require('../services/imageService');
const { fetchCountries, fetchExchangeRates } = require('../services/externalApi');
const { processCountries } = require('../services/countryService');
const {
  upsertCountry,
  updateMetadata,
  getAllCountries: getAllCountriesFromDB,
  getCountryByName: getCountryByNameFromDB,
  getStatus: getStatusFromDB,
  deleteCountry: deleteCountryFromDB
} = require('../services/databaseService');

const refreshCountries = async (req, res) => {
    try {
        
        const countries = await fetchCountries();
        
        const exchangeRate = await fetchExchangeRates();
        
        const processedCountries = processCountries(countries, exchangeRate);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const country of processedCountries) {
            try {
                await upsertCountry(country);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to upsert ${country.name}:`, error.message);
                errorCount++;
            }
        }
        
        // Update metadata table with current timestamp
        const timestamp = new Date().toISOString();
        await updateMetadata('last_refreshed_at', timestamp);
        
        // Send success response
        res.status(200).json({
            message: 'Countries refreshed successfully',
            total_countries: processedCountries.length,
            successful_upserts: successCount,
            failed_upserts: errorCount,
            timestamp: timestamp
        });
        
        console.log(`✅ Refresh completed: ${successCount} successful, ${errorCount} failed`);
        
        // Generate summary image after successful refresh
        try {
            console.log('🎨 Generating summary image...');
            await generateSummaryImage(processedCountries, processedCountries.length, timestamp);
        } catch (imageError) {
            console.error('⚠️ Image generation failed:', imageError.message);
            // Don't fail the entire refresh if image generation fails
        }
    } catch (error) {
        console.error('❌ Refresh failed:', error.message);
        
        // Determine error type and status code
        if (error.message.includes('RestCountries')) {
            res.status(503).json({
                error: 'External data source unavailable',
                details: 'Could not fetch data from RestCountries API'
            });
        } else if (error.message.includes('Exchange Rates')) {
            res.status(503).json({
                error: 'External data source unavailable',
                details: 'Could not fetch data from Exchange Rates API'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to refresh countries',
                details: error.message
            });
        }
    }
}

const getAllCountries = async (req, res) => {
    try {
        
        // Extract query parameters
        const { region, currency, sort } = req.query;
        
        // Build filters object
        const filters = {};
        if (region) filters.region = region;
        if (currency) filters.currency = currency;
        
        // Get countries from database
        const countries = await getAllCountriesFromDB(filters, sort);
        
        res.status(200).json(countries);
        
    } catch (error) {
        console.error('❌ Error fetching countries:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const getCountryByName = async (req, res) => {
    try {
        
        const countryName = req.params.name;
        
        // Get country from database
        const country = await getCountryByNameFromDB(countryName);
        
        if (!country) {
            return res.status(404).json({
                error: 'Country not found'
            });
        }
        
        res.status(200).json(country);
        
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const getStatus = async (req, res) => {
    try {
        const status = await getStatusFromDB();
        
        res.status(200).json(status);
        
    } catch (error) {
        console.error('❌ Error fetching status:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const deleteCountry = async (req, res) => {
    try {
        
        const countryName = req.params.name;
        
        const deletedRows = await deleteCountryFromDB(countryName);
        
        if (deletedRows === 0) {
            return res.status(404).json({
                error: 'Country not found'
            });
        }

        res.status(200).json({
            message: 'Country deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const getImage = async (req, res) => {
    try {
        
        const fs = require('fs').promises;
        const path = require('path');
        
        const imagePath = path.join(__dirname, '../../cache/summary.png');
        
        // Check if image exists
        try {
            await fs.access(imagePath);
            
            // Serve the image file
            res.sendFile(imagePath);
            console.log('✅ Image served successfully');
            
        } catch (fileError) {
            console.log('❌ Image file not found');
            res.status(404).json({
                error: 'Summary image not found'
            });
        }
        
    } catch (error) {
        console.error('❌ Error serving image:', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

module.exports = {
    refreshCountries,
    getAllCountries,
    getCountryByName,
    getStatus,
    deleteCountry,
    getImage
};