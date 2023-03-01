import fetch from "node-fetch";
import {
  Webhook,
  CreateWebhookArgs,
  GetWebhooksArgs,
  GetWebhooksReqResponse,
  GetWebhookArgs,
  GetWebhookJwksReqResponse,
  RemovewebhookArgs,
  UpdateWebhookArgs,
} from "@/dto/platform-core/webhooks";
import { IAuth } from "@/dto/setup";

const createWebhook =
  (auth: IAuth) =>
  async (args: CreateWebhookArgs): Promise<Webhook> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const getWebhooks =
  (auth: IAuth) =>
  async (args?: GetWebhooksArgs): Promise<GetWebhooksReqResponse> => {
    let url = "";
    switch (args) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/webhooks`;
        break;
      default:
        const query = new URLSearchParams({
          limit: args?.query.pagination.limit.toString(),
          cursor: args?.query.pagination.cursor,
        });
        url = `${auth.baseUrl}/core/v1/webhooks?${query}`;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const getWebhook = (auth: IAuth) => async (args: GetWebhookArgs): Promise<Webhook> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/webhooks/${args.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
    },
  });
  return await resp.json();
};

const updateWebhook = (auth: IAuth) => async (args: UpdateWebhookArgs): Promise<Webhook> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/webhooks/${args.query.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
      body: JSON.stringify(args.body)
    },
  });
  return await resp.json();
};

const removeWebhook = (auth: IAuth) => async (args: RemovewebhookArgs): Promise<void> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/webhooks/${args.query.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
    },
  });
  return await resp.json();
};

const getWebhookJwks = (auth: IAuth) => async (): Promise<GetWebhookJwksReqResponse> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/webhooks/jwks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
    },
  });
  return await resp.json();
};

export const WebhookService = (auth: IAuth) => {
  return {
    createWebhook: createWebhook(auth),
    getWebhooks: getWebhooks(auth),
    getWebhook: getWebhook(auth),
    updateWebhook: updateWebhook(auth),
    removeWebhook: removeWebhook(auth),
    getWebhookJwks: getWebhookJwks(auth),
  };
};
