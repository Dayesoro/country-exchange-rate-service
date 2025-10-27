-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS metadata;

-- Countries table
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(15, 6),
  estimated_gdp DECIMAL(20, 2),
  flag_url VARCHAR(500),
  last_refreshed_at TIMESTAMP NULL,
  INDEX idx_region (region),
  INDEX idx_currency (currency_code)
);

-- Metadata table for global refresh timestamp
CREATE TABLE metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial metadata row
INSERT INTO metadata (key_name, value) 
VALUES ('last_refreshed_at', NULL);