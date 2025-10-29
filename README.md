# Country Exchange Rate API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with exchange rate calculations.

## Features

- 🌍 Fetch country data from RestCountries API
- 💰 Get exchange rates from Open Exchange Rates API
- 📊 Calculate estimated GDP using population and exchange rates
- 🖼️ Generate summary images with country statistics
- 🔍 Filter and sort countries by various criteria
- 🗑️ CRUD operations for country data

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Dayesoro/country-exchange-rate-service.git
   cd country-exchange-rate-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

   Now edit the `.env` file with your actual configuration values (see Environment Variables section below for details).

4. **Set up the database**

   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE country_exchange_db;

   # Run the schema
   mysql -u root -p country_exchange_db < src/database/schema.sql
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` or your specified PORT

## Environment Variables

The `.env` file contains all the configuration your application needs. Here's how to set it up:

### Step 1: Copy the template

```bash
cp .env.example .env
```

### Step 2: Edit the `.env` file

Open the `.env` file in your text editor and update the values:

```env
# Database Configuration
DB_HOST=localhost                    # Your MySQL server address
DB_USER=root                         # Your MySQL username
DB_PASSWORD=your_actual_password     # Your MySQL password (REQUIRED)
DB_NAME=country_exchange_db          # Database name (create this first)
DB_PORT=3306                         # MySQL port (usually 3306)

# Server Configuration
PORT=3000                           # Port for your API server

# External APIs (usually no need to change these)
COUNTRIES_API_URL=https://restcountries.com/v2/all
EXCHANGE_RATES_API_URL=https://open.er-api.com/v6/latest/USD
```

### Step 3: Important Notes

- **DB_PASSWORD**: Replace `your_actual_password` with your real MySQL password
- **DB_NAME**: Make sure you create this database in MySQL first (see database setup above)
- **PORT**: Change if you want to run on a different port
- **External APIs**: These URLs usually don't need to be changed

### Example `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=country_exchange_db
DB_PORT=3306

# Server Configuration
PORT=3000

# External APIs
COUNTRIES_API_URL=https://restcountries.com/v2/all
EXCHANGE_RATES_API_URL=https://open.er-api.com/v6/latest/USD
```

### Troubleshooting Environment Setup

**Common Issues:**

- **"Database connection failed"**: Check your `DB_PASSWORD` and make sure MySQL is running
- **"Database doesn't exist"**: Make sure you created the database: `CREATE DATABASE country_exchange_db;`
- **"Access denied"**: Verify your MySQL username and password are correct

## API Endpoints

### POST /countries/refresh

Fetch all countries and exchange rates, then cache them in the database.

**Response:**

```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "successful_upserts": 248,
  "failed_upserts": 2,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### GET /countries

Get all countries from the database with optional filtering and sorting.

**Query Parameters:**

- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort by field (e.g., `?sort=gdp_desc`)

**Available sort options:**

- `gdp_desc` - Highest GDP first
- `gdp_asc` - Lowest GDP first
- `population_desc` - Highest population first
- `population_asc` - Lowest population first
- `name_asc` - Alphabetical A-Z
- `name_desc` - Alphabetical Z-A

**Example:**

Open in your browser or Postman:

```
http://localhost:3000/countries?region=Africa&sort=gdp_desc
```

### GET /countries/:name

Get a specific country by name.

**Example:**

Open in your browser or Postman:

```
http://localhost:3000/countries/Nigeria
```

### GET /status

Get API status information.

**Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-01-27T10:30:00.000Z"
}
```

### GET /countries/image

Serve the generated summary image.

Returns a PNG image or JSON error if not found.

### DELETE /countries/:name

Delete a country from the database.

**Response:**

```json
{
  "message": "Country deleted successfully"
}
```

## Testing

### Method 1: Using Your Browser (for GET requests)

You can test most endpoints directly in your browser by visiting the URLs:

1. **Start the server**

   ```bash
   npm run dev
   ```

2. **Test GET endpoints in your browser:**
   - **Health check**: `http://localhost:3000/health`
   - **All countries**: `http://localhost:3000/countries`
   - **Filter by region**: `http://localhost:3000/countries?region=Africa`
   - **Sort by GDP**: `http://localhost:3000/countries?sort=gdp_desc`
   - **Specific country**: `http://localhost:3000/countries/Nigeria`
   - **API status**: `http://localhost:3000/status`
   - **Summary image**: `http://localhost:3000/countries/image`

### Method 2: Using Postman (recommended for all requests)

Postman is a free tool that makes API testing much easier:

1. **Download Postman** from [postman.com](https://www.postman.com/downloads/)

2. **Start your server**

   ```bash
   npm run dev
   ```

3. **Test all endpoints in Postman:**

   **POST /countries/refresh**

   - Method: `POST`
   - URL: `http://localhost:3000/countries/refresh`
   - Body: None needed

   **GET /countries**

   - Method: `GET`
   - URL: `http://localhost:3000/countries`
   - Try with query parameters: `?region=Africa&sort=gdp_desc`

   **GET /countries/:name**

   - Method: `GET`
   - URL: `http://localhost:3000/countries/Nigeria`

   **GET /status**

   - Method: `GET`
   - URL: `http://localhost:3000/status`

   **GET /countries/image**

   - Method: `GET`
   - URL: `http://localhost:3000/countries/image`

   **DELETE /countries/:name**

   - Method: `DELETE`
   - URL: `http://localhost:3000/countries/Nigeria`

### Testing Steps

1. **First, refresh the data:**

   - Use POST method in Postman
   - URL: `http://localhost:3000/countries/refresh`
   - This will fetch fresh data and generate the summary image

2. **Then test the GET endpoints:**

   - Try different filters and sorting options
   - Check that the summary image was generated

3. **Test error cases:**
   - Try accessing a non-existent country
   - Try accessing the image before refreshing data

## Project Structure

```
src/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   └── countryController.js # Request handlers
├── database/
│   └── schema.sql          # Database schema
├── routes/
│   └── countryRoutes.js    # Route definitions
├── services/
│   ├── countryService.js   # Business logic
│   ├── databaseService.js # Database operations
│   ├── externalApi.js      # External API calls
│   └── imageService.js     # Image generation
└── server.js               # Express app entry point
```

## Error Handling

The API returns consistent JSON error responses:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - External API unavailable
