// Copyright 2020 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();
let collectionSnapshot;

async function setData() {
  try {
    collectionSnapshot = await db.collection('socks').get();
  } catch (error) {
    console.error(error);
  }
  try {
    collectionSnapshot.forEach(async (item) => {
      const thisItem = item.data();
      console.log(thisItem.name); // just for fun, log the items
      const stripeProduct = await stripe.products.create(
        {
          name: thisItem.name,
          description: thisItem.description,
          images: [thisItem.images[0]]
      });
      const product = stripeProduct.id;
      // create a price object for the item
      await stripe.prices.create({
        product: product,
        unit_amount: thisItem.price,
        currency: 'usd',
      });
      // add resulting product ID to the item
      await db.collection('socks').doc(thisItem.name).set({product: product}, {merge: true});
    })
  } catch (error) {
    console.error(error);
  }
}

setData().then(() => {
  console.log('upload complete!');
});


