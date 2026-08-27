# TradeX — Paper Trading Platform (MERN Stack)

TradeX is a full-stack stock trading simulation platform. Users practice buying and selling US stocks with **$100,000 virtual funds**, track portfolio performance, manage watchlists, and analyze strategies using real-time market data.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, Redux Toolkit, React Router, Bootstrap 5, Chart.js, Axios, React Toastify |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs, role-based access (user / admin) |
| **Market Data** | Finnhub API (real-time quotes & historical candles) |

## Features

- User registration & secure login
- JWT authentication with user/admin roles
- Stock listing, search, and detail pages with charts
- Virtual buy/sell paper trading
- Portfolio management with P&L tracking
- Watchlist CRUD
- Admin panel for stock management (full CRUD)
- Responsive Bootstrap UI with toast notifications
- Request logging & centralized error handling

## Project Structure

```
Smart/
├── backend/          # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/       # User, Stock, Portfolio, Transaction, Watchlist
│   ├── routes/
│   ├── scripts/seed.js
│   └── server.js
├── frontend/         # React (Vite) app
│   └── src/
│       ├── components/
│       ├── pages/
│       └── store/    # Redux slices
├── postman/          # API testing collection
└── README.md
```

## Prerequisites

- **Node.js** v16+
- **npm**
- **MongoDB** (local or Atlas)
- **Finnhub API key** (free at [finnhub.io](https://finnhub.io))

## Setup Instructions

### 1. Clone & install dependencies

```bash
cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tradex
JWT_SECRET=your_super_secret_jwt_key
FINNHUB_API_KEY=your_finnhub_api_key
INITIAL_BALANCE=100000
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@tradex.com
ADMIN_PASSWORD=admin123
```

### 3. Seed database (stocks + admin user)

```bash
cd backend
npm run seed
```

Default admin credentials:
- Email: `admin@tradex.com`
- Password: `admin123`

### 4. Run the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Database Collections

| Collection | Purpose |
|------------|---------|
| **Users** | Accounts, bcrypt passwords, roles |
| **Stocks** | Admin-managed tradeable stock catalog |
| **Portfolios** | Cash balance + embedded holdings per user |
| **Transactions** | Buy/sell order history |
| **Watchlists** | User saved stocks |

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | User |

### Stocks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/stocks/search?q=` | Public |
| GET | `/api/stocks/popular` | Public |
| GET | `/api/stocks/quote/:symbol` | Public |
| GET | `/api/stocks/history/:symbol` | Public |
| GET | `/api/stocks` | Admin |
| POST | `/api/stocks` | Admin |
| PUT | `/api/stocks/:symbol` | Admin |
| DELETE | `/api/stocks/:symbol` | Admin |

### Trade
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/trade/buy` | User |
| POST | `/api/trade/sell` | User |

### Portfolio
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/portfolio` | User |
| GET | `/api/portfolio/transactions` | User |
| GET | `/api/portfolio/performance` | User |

### Watchlist
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/watchlist` | User |
| POST | `/api/watchlist` | User |
| DELETE | `/api/watchlist/:symbol` | User |

## Postman Testing

Import `postman/TradeX.postman_collection.json` into Postman.

1. Run **Login** and copy the `token` from the response.
2. Set the collection variable `token` to your JWT.
3. Test all CRUD, auth, trade, and watchlist endpoints.

## Git Version Control

```bash
git init
git add .
git commit -m "Initial TradeX MERN stack project"
```

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Admin routes protected by role middleware
- CORS restricted to `CLIENT_URL`
- Never commit `.env` files

## License

MIT — for educational use.
