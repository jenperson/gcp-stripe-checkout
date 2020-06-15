// Copyright 2020 Google LLC

// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Firestore = require('@google-cloud/firestore');
const express = require('express');
const app = express();

const PROJECT_NAME = process.env.PROJECT_NAME;
const DOMAIN = process.env.DOMAIN;

// Endpoint defintion
app.get('/session', async (req, res) => {
  const db = new Firestore({
    projectId: PROJECT_NAME,
    timestampsInSnapshots: true
  });

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    let product = req.query.product;
    let productRef = db.collection('socks').doc(product);

    productRef
      .get()
      .then(async doc => {
        // Get inventory data from Firestore
        const data = doc.data();

        // Create a CheckoutSession on Stripe with the order information
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              name: data.name,
              description: data.description,
              amount: data.price,
              currency: 'usd',
              quantity: 1,
              images: [data.image]
            }
          ],
          success_url: DOMAIN + '/completed.html',
          cancel_url: DOMAIN + '/canceled.html',
          metadata: { file: data.file }
        });

        // Send the session to the client
        res.send(session);
      })
      .catch(err => {
        console.log('Error when creating CheckoutSession', err);
        res.status(500).send('Server error');
      });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});