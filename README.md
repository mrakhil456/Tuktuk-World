# TUKTUK WORLD — React + Vite + MERN

A functional e-commerce starter with product browsing, search, cart, login-protected checkout, COD, Razorpay, admin dashboard, product management and admin order notifications.

## Authentication

Both customers and admins can use either:

1. **Email + Password**
2. **Mobile + OTP*

## Run backend

```powershell
cd server
Copy-Item .env.example .env
notepad .env
npm install
npm run seed
npm run dev
```

Set `MONGO_URI` to your MongoDB Atlas URI if you use Atlas instead of local MongoDB.

## Run frontend

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- `npm run seed` creates/updates the admin and only inserts demo products when the database has no products; it does not delete existing products.
- Real SMS requires Twilio Verify credentials.
- Online payment requires Razorpay credentials.
- Orders are blocked by the backend unless a valid login token is supplied.
