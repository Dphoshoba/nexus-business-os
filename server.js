
// Nexus Business OS - Full Stack Server
// Run this using: npm start

const path = require('path');
const fs = require('fs');

// --- 1. Dependency Check ---
// We check for modules before trying to use them to give a helpful error message.
try {
  require.resolve('express');
  require.resolve('cors');
  require.resolve('stripe');
} catch (e) {
  console.error('\n\x1b[31m%s\x1b[0m', '❌ ERROR: Missing dependencies.');
  console.error('\x1b[33m%s\x1b[0m', '👉 Please run the following command to install them:');
  console.error('\n    npm install\n');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

// Try to load dotenv, but don't crash if it's missing (optional for some envs)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not found, assuming env vars are set externally
}

// --- 2. Configuration ---
const app = express();
const PORT = process.env.PORT || 4242;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe if key is present
const stripe = STRIPE_KEY ? require('stripe')(STRIPE_KEY) : null;

// --- 3. Middleware ---
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
// This allows the Node server to host your React frontend
app.use(express.static(__dirname));

// --- 4. API Endpoints ---

// Health Check
app.get('/api/health', (req, res) => {
  res.send({ 
    status: 'Online', 
    service: 'Nexus OS', 
    payments: stripe ? 'Active' : 'Disabled (No Key)' 
  });
});

// Payment Intent Endpoint
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).send({ error: 'Amount is required' });
  }

  // Simulation Mode if Stripe is not configured
  if (!stripe) {
    console.log(`⚠️  Mocking Payment: $${(amount/100).toFixed(2)} (Stripe Key Missing)`);
    // Return a fake client secret for the frontend to handle gracefully (or fail gracefully)
    return res.status(503).send({ 
      error: 'Stripe not configured',
      message: 'Server is running in demo mode. Add STRIPE_SECRET_KEY to .env to process real payments.'
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).send({ 
      error: error.message,
      message: "Payment processing failed."
    });
  }
});

// --- 5. Frontend Fallback ---
// Any request that doesn't match an API route will serve the React App (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 6. Start Server ---
app.listen(PORT, () => {
  console.log(`\n🚀 Nexus Business OS is running!`);
  console.log(`\n👉 Open your browser at: \x1b[36mhttp://localhost:${PORT}\x1b[0m\n`);
  
  if (!STRIPE_KEY) {
    console.warn("⚠️  Note: STRIPE_SECRET_KEY is missing. Payments will be simulated.");
  }
});
