# Cryptocurrency Portfolio Tracker API

A TypeScript-based REST API for tracking cryptocurrency portfolios using Node.js, Express, and Supabase.

## Features

- User management
- Portfolio tracking 
- Real-time cryptocurrency prices
- Swagger API documentation
- Docker containerization

## Prerequisites

- Node.js 16+
- npm
- Supabase account
- Git

## Tech Stack

- TypeScript
- Express.js
- Supabase (Database)
- Winston (Logging)
- Node-Cache
- Docker

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/rodweleo/crypto-tracker-backend.git
cd crypto-tracker-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure Supabase:
- Create a Supabase project at https://supabase.com

Add required tables:
1. gochapaa_users
2. gochapaa_cryptocurrency_prices
3. gochapaa_users_portfolios_insights
4. gochapaa_users_portfolio_coins
5. gochapaa_users_transactions

Copy Supabase credentials to .env:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the server
```bash
nodemon src/app.ts
```

- The API will be available at http://localhost:3000/api/*

## Docker Setup
1. Build the container
```bash
    docker build -t crypto-tracker-backend .
```
2. Run with Docker compose
```bash
    docker-compose up
```

## API Documentation
### Access Swagger documentation at: http://localhost:3000/api-docs
### Core Endpoints
#### Users
```bash

# Create user
POST /api/users/create
{
  "name": "John Doe",
  "email": "john@example.com"
}

# Get user by email
GET /api/users/{email}

```

#### Portfolio
```bash

# Create portfolio entry
POST /api/portfolios/create
{
  "portfolio_id": "uuid",
  "name": "Bitcoin",
  "quantity": 0.5,
  "purchase_price": 65000
}

# Get portfolio insights
GET /api/portfolios/insights/{id}

# Update coin in portfolio
PUT /api/portfolios/{portfolioId}/coins
{
  "coin": "Bitcoin",
  "quantity": 1.5,
  "purchase_price": 65000
}

```

#### Crypto
```bash
# Get live prices
GET /api/crypto/live-prices
```

### Testing
The API can be tested using tools like Postman or curl:

```bash
# Test live prices endpoint
curl http://localhost:3000/api/crypto/live-prices

# Create a user
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

## Project Structure
```bash

src/
├── controllers/       # Request handlers
├── models/           # Data models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utilities
└── app.ts            # Application entry

```

