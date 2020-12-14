# Postman

Postman is a collaboration platform for API development. Postman's features simplify each step of building an API and streamline collaboration so you can create better APIs—faster.

## Install

Visit the Postman [downloads page](https://www.postman.com/downloads/) to install the desktop client for your system.

## Getting started
- Copy the `Platform Core API.postman_collection.json` and `MATTR Tenant env.postman_environment.json` and save them locally


## Setup

First import the Tenant Environment variables,

Go to Manage Environment button in the top-right
Choose `Import` button
![import env](./assets/postman-import-env.png)

Select the `MATTR Tenant env.postman_environment.json` file from your local drive
Once the file has successfully imported you will see the Environment available

![Manage Environments](./assets/postman-manage-env.png)

To add your Tenant specific variable click on the text `MATTR Tenant env`

`baseUrl` is your full tenant URL
`auth_client_id` is your Client ID for authorization to the API 
`auth_client_secret` is your Client Secret for authorization to the API
`issuerDID` and `subjectDid` can be updated later

Click 'Update' to save.



Next import the Collection

Go to Import in the menu in the top-left
![Import Collection](./assets/postman-import-collection.png)

In File, click Upload file button
Select the `Platform Core API.postman_collection.json` file
Once the file has successfully imported you will see the Platform Core API collection


## Try it out
Go to a protected endpoint e.g.
`DIDs` > `Retrieve a List of DIDs`

Hit `Send` in the top right of the Request pane (middle of the application)

See the response in the `Preview` section of the Response pane on the right.