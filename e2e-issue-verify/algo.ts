// core.service.ts
const customDomainVerified = () => true;
const hasValidDids = () => true; //
const getPresentationTemplateDidAuth = () => {};
const getPresentationTemplateQueryByExample = () => {};

// Triggered for getting any did:key
const getVerifierDid = () => {
  const validDIDs = hasValidDids();
  if (validDIDs) {
    return validDIDs[0];
  } else {
    return createDid(); // keyType = Ed25519
  }
};

// Triggered for getting any non-bbs DID
const getIssuerDid = () => {
  const hasCustomDomainVerified = customDomainVerified();
  if (hasCustomDomainVerified) {
    const didWeb = retrieveDid(); // get did:web
    if (!didWeb) {
      createDid(); // create did:web of the domain
    } else {
      return didWeb;
    }
  } else {
    const validDIDs = hasValidDids();
    if (validDIDs) {
      return validDIDs[0];
    } else {
      return createDid(); // keyType = Ed25519
    }
  }
};

// Triggered when requesting wallet DID
const createPresentationReqDidAuth = () => {
  const verifier = getVerifierDid();
  const template = getPresentationTemplateDidAuth(); // uses verifier.id
  const presentationRequest = createPresentationRequest(); // uses template.id
  const signed = signMessage(); // presentationRequest.request
  db.PresentationRequest.create({ signedRequest: signed, type: "DIDAuth" }); //
};

// Triggered when issuing static credentials
const issueBasicCredential = async () => {
  const issuer = getIssuerDid();
  const credential = createCredential(); // uses issuer
  const encryped = encryptMessage(); // uses issuer & credential
  sendMessage(); // uses encryped
};

// Triggered when requesting a credential from wallet
const createPresentationReqQueryByExample = () => {
  const verifier = getVerifierDid();
  const template = getPresentationTemplateQueryByExample(); // uses verifier.id
  const presentationRequest = createPresentationRequest(); // uses template.id
  const signed = signMessage(); // presentationRequest.request
  db.PresentationRequest.create({ signedRequest: signed, type: "QueryByExample" }); //
};

// Triggered when checking if claims is received for a PresentationRequest in db
const getClaims = (args: { id: string }) => {
  const { id } = args;
  return db.PresentationRequest.findUnique({ id });
};

// Triggered when adding claims received for a PresentationRequest into db
const receiveClaims = () => {
  // prevent updating db record if claims alreayd exist
  // proceed if otherwise
};

// mattr.sevice.ts
const retrieveCustomDomain = () => {};
const retrieveDids = () => ["a", "b", "c"] || false;
const retrieveDid = () => ({} || false);
const createDid = () => {};
const retrievePresentationTemplates = () => {};
const createPresentationTemplate = () => {};
const createPresentationRequest = () => {};
const retrievePresentationRequest = () => {};
const signMessage = () => "";
const createCredential = () => {};
const encryptMessage = () => {};
const sendMessage = () => {};

// db.service.ts
const db = {
  PresentationRequest: {
    create: (args: PresentationRequest) => true,
    update: (args: { id: string }) => true,
    findUnique: (args: { id: string }) => {
      claims: undefined;
    },
  },
};

type PresentationRequest = {
  signedRequest?: string;
  type: PRESENTATION_REQUEST;
  claims?: any;
};

type PRESENTATION_REQUEST = "QueryByExample" | "DIDAuth";
