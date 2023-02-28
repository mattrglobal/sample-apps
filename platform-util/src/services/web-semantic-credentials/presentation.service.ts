import { IAuth } from '@/dto/setup';

const createPresentationTemplate = (auth: IAuth) => async (args: string) => {
  return { auth, args };
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
