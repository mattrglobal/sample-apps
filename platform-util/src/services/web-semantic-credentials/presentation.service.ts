import { IAuth } from "@/dto/setup";
import {
  CreatePresentationTemplateArgs,
  DeletePresentationTemplateArgs,
  PresentationTemplate,
  RetrievePresentationTemplateArgs,
} from "@/dto/web-semantic-credentials";

const createPresentationTemplate = (auth: IAuth) => async (args: CreatePresentationTemplateArgs) => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/presentations/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
    },
    body: JSON.stringify(args.body),
  });
  return await resp.json();
};

const retrievePresentationTemplates = (auth: IAuth) => async (): Promise<PresentationTemplate[]> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/presentations/templates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.authToken}`,
    },
  });
  return await resp.json();
};

const retrievePresentationTemplate =
  (auth: IAuth) =>
  async (args: RetrievePresentationTemplateArgs): Promise<PresentationTemplate> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/presentations/templates/${args.query.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const deletePresentationTemplate =
  (auth: IAuth) =>
  async (args: DeletePresentationTemplateArgs): Promise<void> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/presentations/templates/${args.query.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const updatePresentationTemplate = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

const createPresentationRequest = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

const createPresentation = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

const verifyPresentation = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

export const PresentationService = (auth: IAuth) => {
  return {
    createPresentationTemplate: createPresentationTemplate(auth),
    retrievePresentationTemplates: retrievePresentationTemplates(auth),
    retrievePresentationTemplate: retrievePresentationTemplate(auth),
    deletePresentationTemplate: deletePresentationTemplate(auth),
    updatePresentationTemplate: updatePresentationTemplate(auth),
    createPresentationRequest: createPresentationRequest(auth),
    createPresentation: createPresentation(auth),
    verifyPresentation: verifyPresentation(auth),
  };
};
