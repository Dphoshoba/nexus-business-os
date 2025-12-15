
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// TODO: Replace with your actual Stripe Publishable Key
// You can get this from your Stripe Dashboard -> Developers -> API Keys
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); 

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
        <App />
    </Elements>
  </React.StrictMode>
);
