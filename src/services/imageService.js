const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a summary image with country statistics using Sharp
 */
async function generateSummaryImage(countriesData, totalCountries, lastRefreshedAt) {
    try {
        // Create SVG content for the image
        const svgContent = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        .title { font: bold 32px Arial; fill: #2c3e50; }
                        .subtitle { font: 24px Arial; fill: #2c3e50; }
                        .header { font: bold 20px Arial; fill: #2c3e50; }
                        .text { font: 16px Arial; fill: #34495e; }
                        .timestamp { font: 14px Arial; fill: #7f8c8d; }
                    </style>
                </defs>
                
                <!-- Background -->
                <rect width="800" height="600" fill="#f8f9fa"/>
                
                <!-- Title -->
                <text x="400" y="50" text-anchor="middle" class="title">Country Exchange Rate Summary</text>
                
                <!-- Total Countries -->
                <text x="400" y="100" text-anchor="middle" class="subtitle">Total Countries: ${totalCountries}</text>
                
                <!-- Top 5 Countries Header -->
                <text x="50" y="150" class="header">Top 5 Countries by Estimated GDP:</text>
                
                ${generateTopCountriesList(countriesData)}
                
                <!-- Timestamp -->
                <text x="400" y="550" text-anchor="middle" class="timestamp">Last Updated: ${lastRefreshedAt}</text>
            </svg>
        `;
        
        // Convert SVG to PNG using Sharp
        const imageBuffer = await sharp(Buffer.from(svgContent))
            .png()
            .toBuffer();
        
        // Save image
        const imagePath = path.join(__dirname, '../../cache/summary.png');
        await fs.writeFile(imagePath, imageBuffer);
        
        console.log('✅ Image saved to cache/summary.png');
        return imagePath;
        
    } catch (error) {
        console.error('❌ Error generating image:', error.message);
        throw new Error('Failed to generate summary image');
    }
}

/**
 * Generate SVG text elements for top 5 countries
 */
function generateTopCountriesList(countriesData) {
    // Sort countries by GDP and get top 5
    const topCountries = countriesData
        .filter(country => country.estimated_gdp !== null)
        .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
        .slice(0, 5);
    
    let yPosition = 180;
    return topCountries.map((country, index) => {
        const gdpFormatted = country.estimated_gdp.toLocaleString();
        const textElement = `<text x="50" y="${yPosition}" class="text">${index + 1}. ${country.name}: $${gdpFormatted}</text>`;
        yPosition += 25;
        return textElement;
    }).join('\n                ');
}

module.exports = { generateSummaryImage };