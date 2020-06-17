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

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.STORAGE_BUCKET
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Endpoint defintion
app.get('/addproduct', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    let product = req.query.products;
    setData(products).then(() => {
      console.log('upload complete!');
      res.send(session);
    })
    .catch(err => {
        console.log('Error when creating CheckoutSession', err);
        res.status(500).send('Server error');
     });
  }
});


// let items = [
//   {
//     name: 'apple',
//     description: 'For the apple lover in your life',
//     price: 999
//   },
//   {
//     name: 'donut',
//     description: 'Some super sweet socks',
//     price: 999
//   },
//   {
//     name: 'stripes',
//     description: 'Classy and classic design',
//     price: 599
//   },
//   {
//     name: 'blue',
//     description: 'Simple, yet shockingly sophisticated',
//     price: 599
//   }
// ]

async function setData(items) {
  for (item of items) {
    console.log(item);
    let thisItem = item;
    const filename = `${item.name}.png`;
    try {
      // upload the image to Cloud Storage
      await bucket.upload(`product_img/${filename}`, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      const config = {
        action: 'read',
        expires: '03-17-2025'
      };
      // get a signed URL so the image can be viewed publicly
      const url = await bucket.file(filename).getSignedUrl(config);
      // add URL to the data about the item
      thisItem.images = url
      // upload object data to Cloud Firestore
      await db.collection('socks').doc(item.name).set(thisItem);
    } catch (error) {
      console.error(error);
    }
  }
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});