# Part 0 - Set up inventory

Before launching our sock shop, let's create an inventory of socks to sell. It's important to put sensitive data about the inventory on the server -- do not pass amounts to charge from the client, since that can be easily manipulated by your users.

Instead, pass the IDs of the items the customer wants to purchase, and use a Node.js app deployed to Cloud Run to look up pricing information.

## Step 1: Inventory on Firestore

Set up your inventory with Firestore. We will create a new collection called "socks" and create four documents (one for each sock we want to sell).

| ID      | Description                          | Price |
| ------- | :----------------------------------- | ----- |
| apple   | For the apple lover in your life     | 999   |
| donut   | Some super sweet socks               | 999   |
| stripes | Classy and classic design            | 599   |
| blue    | Simple, yet shockingly sophisticated | 599   |

Use the Node.js app in the create-inventory-function to upload the sock patterns.

`cd upload-function`

From the terminal, run `npm install` to install the required Node.js packages.

Downlaod a new [Service Account key](https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts/adminsdk) from the Firebase console.

Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the file path of the JSON file that contains your service account key. This variable only applies to your current shell session, so if you open a new session, set the variable again.

`export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"`

