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

const stripe = Stripe('pk_test_ABCde');
const db = firebase.firestore();
const sockRef = db.collection('socks');
let selectedProduct;

  let productList = "";
  sockRef.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const data = doc.data();
      let name = data.name;
      // capitalize first letter for display purposes
      let displayName = name.charAt(0).toUpperCase() + name.slice(1);
      if (!selectedProduct) {
        selectedProduct = name;
      }
      const amount = data.price;
      const image = data.images[0];
      productList = productList+`<option data-amount="${amount}" data-id="${name}" data-img="${image}">${displayName}</option>`
    });
    document.getElementById("select").innerHTML = productList;
  })
  .catch(function(error) {
    console.log("Error getting documents: ", error);
    return error;
  });

document
.getElementById("pay-button")
.addEventListener("click", function() {
  document.getElementById("spinner").classList.remove("hidden");
  document.getElementById("label").classList.add("hidden");

  fetch(
    "https://[your_cloud_run_url]/session?product=" +
      selectedProduct
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(session) {
      document.getElementById("spinner").classList.add("hidden");
      document.getElementById("label").classList.remove("hidden");

      stripe
        .redirectToCheckout({
          sessionId: session.id
        })
        .then(function(result) {
          if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer.
            var displayError = document.getElementById("error-message");
            displayError.textContent = result.error.message;
          }
        });
    })
    .catch(function(error) {
      console.log("errors", error);
    });
});

document
.querySelector("select")
.addEventListener("change", function(evt) {
  const data = document.querySelector("select :checked").dataset;

  selectedProduct = data.id;
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  document.getElementById(
    "total-amount"
  ).textContent = formatter.format(data.amount / 100);

  document.getElementById("preview").setAttribute("src", data.img);
});

