import { IAuth } from '@/dto/setup';
import { CreatePresentationTemplateArgs } from '@/dto/web-semantic-credentials';

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

const retrievePresentationTemplates = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

const retrievePresentationTemplate = (auth: IAuth) => async (args: string) => {
  return { auth, args };
};

const deletePresentationTemplate = (auth: IAuth) => async (args: string) => {
  return { auth, args };
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
