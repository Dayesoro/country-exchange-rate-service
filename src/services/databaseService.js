const { pool } = require('../config/database');

/**
 * Check if a country exists in the database (case-insensitive)
 */
async function countryExists(name) {
  const query = 'SELECT id FROM countries WHERE LOWER(name) = LOWER(?)';
  const [rows] = await pool.execute(query, [name]);
  return rows.length > 0;
}

/**
 * Insert a new country into the database
 */
async function insertCountry(countryData) {
  const query = `
    INSERT INTO countries 
    (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    countryData.name,
    countryData.capital,
    countryData.region,
    countryData.population,
    countryData.currency_code,
    countryData.exchange_rate,
    countryData.estimated_gdp,
    countryData.flag_url
  ];
  
  const [result] = await pool.execute(query, params);
  return result.insertId;
}

/**
 * Update an existing country by name
 */
async function updateCountry(name, countryData) {
  const query = `
    UPDATE countries 
    SET 
      capital = ?,
      region = ?,
      population = ?,
      currency_code = ?,
      exchange_rate = ?,
      estimated_gdp = ?,
      flag_url = ?,
      last_refreshed_at = NOW()
    WHERE LOWER(name) = LOWER(?)
  `;
  
  const params = [
    countryData.capital,
    countryData.region,
    countryData.population,
    countryData.currency_code,
    countryData.exchange_rate,
    countryData.estimated_gdp,
    countryData.flag_url,
    name
  ];
  
  const [result] = await pool.execute(query, params);
  return result.affectedRows;
}

/**
 * Insert or update a country (upsert logic)
 */
async function upsertCountry(countryData) {
  const exists = await countryExists(countryData.name);
  
  if (exists) {
    return await updateCountry(countryData.name, countryData);
  } else {
    return await insertCountry(countryData);
  }
}

/**
 * Get metadata value by key name
 */
async function getMetadata(keyName) {
  const query = 'SELECT value, updated_at FROM metadata WHERE key_name = ?';
  const [rows] = await pool.execute(query, [keyName]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update metadata value by key name
 */
async function updateMetadata(keyName, value) {
  const query = `
    UPDATE metadata 
    SET value = ?, updated_at = NOW() 
    WHERE key_name = ?
  `;
  const [result] = await pool.execute(query, [value, keyName]);
  return result.affectedRows;
}

/**
 * Get all countries with optional filtering and sorting
 */
async function getAllCountries(filters = {}, sortBy = null) {
  let query = 'SELECT * FROM countries';
  const params = [];
  const conditions = [];

  // Build WHERE conditions based on filters
  if (filters.region) {
    conditions.push('region = ?');
    params.push(filters.region);
  }

  if (filters.currency) {
    conditions.push('currency_code = ?');
    params.push(filters.currency);
  }

  // Add WHERE clause if we have conditions
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Add ORDER BY clause for sorting
  if (sortBy) {
    switch (sortBy) {
      case 'gdp_desc':
        query += ' ORDER BY estimated_gdp DESC';
        break;
      case 'gdp_asc':
        query += ' ORDER BY estimated_gdp ASC';
        break;
      case 'population_desc':
        query += ' ORDER BY population DESC';
        break;
      case 'population_asc':
        query += ' ORDER BY population ASC';
        break;
      case 'name_asc':
        query += ' ORDER BY name ASC';
        break;
      case 'name_desc':
        query += ' ORDER BY name DESC';
        break;
      default:
        // Invalid sort parameter, ignore it
        break;
    }
  }

  const [rows] = await pool.execute(query, params);
  return rows;
}

/**
 * Get a single country by name (case-insensitive)
 */
async function getCountryByName(name) {
  const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';
  const [rows] = await pool.execute(query, [name]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get status information (total countries and last refresh)
 */
async function getStatus() {
  // Get total count
  const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM countries');
  const totalCountries = countResult[0].total;

  // Get last refresh timestamp
  const metadata = await getMetadata('last_refreshed_at');
  const lastRefreshedAt = metadata ? metadata.value : null;

  return {
    total_countries: totalCountries,
    last_refreshed_at: lastRefreshedAt
  };
}

module.exports = {
  countryExists,
  insertCountry,
  updateCountry,
  upsertCountry,
  getMetadata,
  updateMetadata,
  getAllCountries,    
  getCountryByName, 
  getStatus
};