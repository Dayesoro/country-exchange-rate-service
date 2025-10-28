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

module.exports = {
  countryExists,
  insertCountry,
  updateCountry,
  upsertCountry,
  getMetadata,
  updateMetadata
};