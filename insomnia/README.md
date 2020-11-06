# Insomnia Core
Insomnia Core is a Desktop API client for REST and GraphQL. Make requests, inspect responses.

## Install

Download from their [downloads page](https://insomnia.rest/download/core/?)

## Getting started

- Copy the Insomnia [import file](Insomnia_mattr_v0.9.json) and save locally
- In Insomnia, open 'Import/Export' from the menu
![insomnia menu](assets/insomnia-import-export.png)
- On 'Import' choose 'From file'  
![Insomnia import file](assets/insomnia-import-file.png)
- Select the saved Insomnia Importer file

## Setup
Inside Insomnia you will now have a Workspace called MATTR V*II* Platform API V1
Inside the workspace there will be an Environment called `MATTR Tenant env` 
> Insomnia leverages 'Nunjunks Templating', so we use that to make calling our API super easy to use. 

Go to 'Manage Environments'
* This will contain a Base Environment

```
{
  "base_url": "{{ scheme }}://{{ tenantSubdomain }}{{ base_path }}"
}
```
The Base Environment pulls together variables from the Sub Environment to help form the requests.

In the Sub Environment
* Add in your provided Tenant Subdomain (e.g. `your-tenant.platform.mattr.global` the protocol is **not** required ), Client ID and Client Secret.

```
{
  "scheme": "https",
  "base_path": "",
  "bearerToken": "{% response 'body', 'req_wrk_eeea6b5f60db458dbd4f5e32477ac165e049a201', 'b64::JC5hY2Nlc3NfdG9rZW4=::46b', 'always', 60 %}",
  "tenantSubdomain": "YOURTENANT",
  "auth": {
    "url": "https://auth.platform.mattr.global",
    "audience": "https://platform.mattr.global",
    "client_id": "YOURCLIENTID",
    "client_secret": "YOURSECRET"
  }
}
```
The object in the `bearerToken` field will do the work to call out to the Auth endpoint on your behalf and grab the required Access Token and make it available to other requests.

![Insomnia Env](assets/insomnia-env.png)

## Try it out
Go to a protected endpoint e.g.
`DIDs` > `Retrieve a List of DIDs`

Hit `Send` in the top right of the Request pane (middle of the application)

See the response in the `Preview` section of the Response pane on the right.

![DID Response](assets/insomnia-did-response.png)