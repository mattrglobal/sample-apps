# MATTR VII Postman Collection

Postman is a collaboration platform for API development. This postman collection provides a simple interface to use MATTR VII API. Its categorized endpoints, sample request body and pre-request scripts make it easier and quicker to interact with your tenant.

## Getting started

### Step 1: Install Postman

Visit the Postman [downloads page](https://www.postman.com/downloads/) to install a desktop client for your system.

### Step 2: Download collection and environment files

Save the following files locally:
- [`Platform API Collection`](./platform-v12.1.0-postman-collection.json): This Postman Collection includes API operations and some configuration.
- [`Tenant Environment`](./mattr-vii.postman_environment.json): This file defines variables for your MATTR VII tenant. You will need to update it with your own tenant variables later.

### Step 3: Import collection and environment files into Postman

1. Open Postman.
2. Select the **Import** button in the _My Workspace_ area.
3. Select the local versions of the _Tenant Environment_ and the _Platform API Collection_ files you downloaded in the previous step.

### Step 4: Update environment variables
   
1. Select the **Environments** button in the _My Workspace_ sidebar.
2. Select the _MATTR VII Tenant_ environment from your environments list.
3. Update the following variables with your tenant details:
   - `baseUrl`: Replace with your tenant's URL.
   - `auth0Base`: Replace with your Authentication server URL.
   - `tenantClientId`: Replace with your Client ID.
   - `tenantClientSecret`: Replace with your Client Secret.
   - `tenantAudience`: Replace with your tenant's URL.
4. Select the `Save` button.

If you are unsure of any of these details, please [contact us](mailto:dev-support@mattr.global).

### Step 5: Try it out

1. Select the Collections button in the _My Workspace_ sidebar.
2. Select the MATTR VII API collection.
3. Select the _Retrieve all IACAs_ endpoint (You can find it under _Tenant configuration > Identifiers > IACA_).
4. Select **Send** in the top right corner of the request pane.
5. The response should be displayed in the _Response_ pane (If this is a new tenant, the response is likely to be empty).

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
