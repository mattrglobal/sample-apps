import {
  CreateInboxArgs,
  CreateInboxReqResponse,
  ListInboxesArgs,
  ListInboxesReqResponse,
  RetrieveInboxNameArgs,
  RetrieveInboxNameReqResponse,
  UpdateInboxArgs,
  UpdateInboxReqResponse,
  DeleteInboxArgs,
  RegisterInboxWithDidArgs,
  RegisterDidWithInboxReqResponse,
  ListInboxDidsArgs,
  ListInboxDidsReqResponse,
  UnregisterDidWithinInboxArgs,
  ListInboxMessagesArgs,
  ListInboxMessagesReqResponse,
  RetrieveMessageArgs,
  Message,
  DeleteMessageArgs,
  SignMessageArgs,
  VerifyMessageArgs,
  VerifyMessageReqResponse,
  EncryptMessageArgs,
  DecryptMessageArgs,
  DecryptMessageReqResponse,
  SendMessageArgs,
} from "@/dto/platform-core/messaging";
import { IAuth } from "@/dto/setup";
import fetch from "node-fetch";

const createInbox =
  (auth: IAuth) =>
  async (args: CreateInboxArgs): Promise<CreateInboxReqResponse> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/inboxes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const listInboxs =
  (auth: IAuth) =>
  async (args: ListInboxesArgs): Promise<ListInboxesReqResponse> => {
    let url: string;
    const pagination = args.query.pagination;
    switch (pagination) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/messaging/inboxes`;
        break;

      default:
        const query = new URLSearchParams({
          limit: pagination?.limit.toString(),
          cursor: pagination?.cursor,
        }).toString();
        url = `${auth.baseUrl}/core/v1/messaging/inboxes?${query}`;
        break;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const retrieveInboxName =
  (auth: IAuth) =>
  async (args: RetrieveInboxNameArgs): Promise<RetrieveInboxNameReqResponse> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    return await resp.json();
  };
const updateInbox =
  (auth: IAuth) =>
  async (args: UpdateInboxArgs): Promise<UpdateInboxReqResponse> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
        body: JSON.stringify(args.body),
      }
    );
    return await resp.json();
  };
const deleteInbox =
  (auth: IAuth) =>
  async (args: DeleteInboxArgs): Promise<void> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    return await resp.json();
  };

const registerDidwithInbox =
  (auth: IAuth) =>
  async (
    args: RegisterInboxWithDidArgs
  ): Promise<RegisterDidWithInboxReqResponse> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.body.did}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
        body: JSON.stringify(args.body),
      }
    );
    return await resp.json();
  };
const listInboxDids =
  (auth: IAuth) =>
  async (args?: ListInboxDidsArgs): Promise<ListInboxDidsReqResponse> => {
    const pagination = args.query.pagination;
    let url: string;
    switch (pagination) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/dids`;
      default:
        const query = new URLSearchParams({
          limit: pagination.toString(),
          cursor: pagination.cursor,
        }).toString();
        url = `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/dids?${query}`;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

// maybe typo on doc - should be 'within an inbox'
const unregisterDidWithinInbox =
  (auth: IAuth) =>
  async (args: UnregisterDidWithinInboxArgs): Promise<void> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/dids`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
        body: JSON.stringify(args.body),
      }
    );
    return await resp.json();
  };

const listInboxMessages =
  (auth: IAuth) =>
  async (
    args: ListInboxMessagesArgs
  ): Promise<ListInboxMessagesReqResponse> => {
    let url: string;
    const pagination = args.query.pagination;
    switch (pagination) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/messages`;
      default:
        const query = new URLSearchParams({
          limit: pagination.limit.toString(),
          cursor: pagination.cursor,
        }).toString();
        url = `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/messages?${query}`;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const retrieveMessage =
  (auth: IAuth) =>
  async (args: RetrieveMessageArgs): Promise<Message> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/messages/${args.query.messageId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    return await resp.json();
  };

const deleteMessage =
  (auth: IAuth) =>
  async (args: DeleteMessageArgs): Promise<void> => {
    const resp = await fetch(
      `${auth.baseUrl}/core/v1/messaging/inboxes/${args.query.inboxId}/messages/${args.query.messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    return await resp.json();
  };

const signMessage =
  (auth: IAuth) =>
  async (args: SignMessageArgs): Promise<string> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const verifyMessage =
  (auth: IAuth) =>
  async (args: VerifyMessageArgs): Promise<VerifyMessageReqResponse> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const encryptMessage =
  (auth: IAuth) =>
  async (args: EncryptMessageArgs): Promise<any> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/encrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const decryptMessage =
  (auth: IAuth) =>
  async (args: DecryptMessageArgs): Promise<DecryptMessageReqResponse> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/decrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const sendMessage =
  (auth: IAuth) =>
  async (args: SendMessageArgs): Promise<void> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/messaging/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

export const MessagingService = (auth: IAuth) => {
  return {
    createInbox: createInbox(auth),
    listInboxs: listInboxs(auth),
    retrieveInboxName: retrieveInboxName(auth),
    updateInbox: updateInbox(auth),
    deleteInbox: deleteInbox(auth),
    registerDidwithInbox: registerDidwithInbox(auth),
    listInboxDids: listInboxDids(auth),
    unregisterDidWithinInbox: unregisterDidWithinInbox(auth),
    listInboxMessages: listInboxMessages(auth),
    retrieveMessage: retrieveMessage(auth),
    deleteMessage: deleteMessage(auth),
    signMessage: signMessage(auth),
    verifyMessage: verifyMessage(auth),
    encryptMessage: encryptMessage(auth),
    decryptMessage: decryptMessage(auth),
    sendMessage: sendMessage(auth),
  };
};
