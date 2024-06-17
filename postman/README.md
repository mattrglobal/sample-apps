# MATTR VII Postman Collection

Postman is a collaboration platform for API development. This postman collection provides a simple interface to use MATTR VII API. Its categorised endpoints, sample request body and pre-request scripts make it easier and quicker to interact with your tenant.

## Getting started

### Step 1: Install Postman

Visit the Postman [downloads page](https://www.postman.com/downloads/) to install a desktop client for your system.

### Step 2: Download collection and environment files

Save the following files locally:
- [`MATTR VII API Collection`](https://github.com/mattrglobal/sample-apps/blob/am/update-postman-readme/postman/mattr-vii.postman_collection.json): This Postman Collection includes API operations and some configuration.
- [`MATTR VII Tenant Environment`](https://github.com/mattrglobal/sample-apps/blob/am/update-postman-readme/postman/mattr-vii.postman_environment.json): This Postman Environment Variables hold specific values for your MATTR VII tenant.

### Step 3: Import collection and environment files into Postman

1. Open Postman.
2. Select the **Import** button in the _My Workspace_ area.
3. Select the local versions of the [_MATTR VII Tenant Environment_](https://github.com/mattrglobal/sample-apps/blob/am/update-postman-readme/postman/mattr-vii.postman_environment.json) and the [_MATTR VII API Collection_]([https://github.com/mattrglobal/sample-apps/blob/am/update-postman-readme/postman/mattr-vii.postman_environment.json](https://github.com/mattrglobal/sample-apps/blob/am/update-postman-readme/postman/mattr-vii.postman_collection.json) files you saved earlier.

### Step 4: Update environment variables
   
1. Select the **Enviornments** button in the _My Workspace_ sidebar.
2. Select the _MATTR VII Tenant (Example ENV)_ environment from your environments list.
3. Update the following variables with your tenant details:
   - `baseUrl`: Replace with your tenant's URL.
   - `auth0Base`: Replace with your Authentication server URL.
   - `tenantClientId`: Replace with your Client ID.
   - `tenantClientSecret`: Replace with your Client Secret.
   - `tenantAudience`: Replace with your tenant's URL.
4. Select the `Save` button.

If you are unsure of any of these details, please [contact us](http://mattr.globa/contact-us).

### Step 5: Try it out

1. Select the Collections button in the _My Workspace_ sidebar.
2. Select the MATTR VII API collection.
3. Select the Retrieve a list of DIDs endpoint (You can find it under _Tenant configuration > DIDs_).
4. Select **Send** in the top right corner of the request pane.
5. The response should be displayed in the _Response_ pane.

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
