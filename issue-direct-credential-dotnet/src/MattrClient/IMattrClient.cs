using Mattr.Models;

namespace Mattr
{

    public interface IMattrClient
    {
        Task<PresentationTemplateResponse> CreateWebSemanticPresentationTemplate<T>(
            PresentationTemplateRequest<T> request,
            // We can change this in later versions to 'CancellationToken cancel? = null'
            CancellationToken cancel = new CancellationToken()
        ) where T : IQueryTypeBase;

        Task<DidResponse> GetDid(
            string did,
            CancellationToken cancel = new CancellationToken()
        );

        Task<string> SignMessage<T>(
            MessagingSignRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        );

        Task SendMessage(
            MessagingSendRequest request,
            CancellationToken cancel = new CancellationToken()
        );

        Task<MessagingEncryptResponse> EncryptMessage<T>(
            string senderDidUrl,
            IReadOnlyList<string> recipientDidUrls,
            MessagingEncryptPayload<T> payload,
            CancellationToken cancel = new CancellationToken()
        );

        Task<PresentationResponse> CreatePresentationRequest(
            PresentationRequest request,
            CancellationToken cancel = new CancellationToken()
        );

        Task<CreateCredentialResponse<T>> SignWebSemanticCredential<T>(
            CreateCredentialRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        );

        Task<RevocationStatus> RevocationStatusWebSemantic(
            RevocationStatusRequest request,
            CancellationToken cancel = new CancellationToken()
        );

        Task<MessagingEncryptResponse> CreateDirectCredentialOffer<T>(
            DirectCredentialOfferRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        );

        Task<DomainConfig> GetTenantDomain(CancellationToken cancel = new CancellationToken());

        Task<AuthTokenResponse> GetAccessToken(CancellationToken cancel = new CancellationToken());
    }
}
