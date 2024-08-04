using System.Collections.Immutable;
using Ardalis.GuardClauses;
using Mattr;
using Mattr.Models;
using MattrIssueDirect.Models.Api;
using MattrIssueDirect.Utils;
using Api = MattrIssueDirect.Models.Api;

namespace MattrIssueDirect.Services
{
    // We are only using object as the payload in the example is dynamic
    // Remember order is important so don't use a collection that doesn't keep the same order
    // Such as Dictionary<string, object> as we must keep the same order
    using CredentialSubject = object;

    public interface ICredentialService
    {
        Task<DirectCredentialResponse> CreateDirectCredentialOffer(
            string subjectDid,
            string messagingDid,
            Credential<CredentialSubject> credential
        );

        Task<CreateCredentialResponse<CredentialSubject>> CreateCredential(Api.CreateCredential create);
    }

    public class CredentialServiceConfig
    {
        public CredentialServiceConfig(IConfiguration config)
        {
            Tenant = Guard.Against.Null(config.GetValue<string>("Mattr:Tenant"), message: "You must configure the Mattr.Tenant in the appsettings.json");
            MobileWalletBundleId = config.GetValue<string>("Mattr:WalletBundleId") ?? "global.mattr.wallet";
        }

        public string Tenant { get; }
        public string MobileWalletBundleId { get; set; }
    }

    public class CredentialService : ICredentialService
    {
        private readonly ILogger<CredentialService> _logger;
        private readonly IMattrClient _mattr;
        private readonly IShortenUrlService _shortenUrl;
        private readonly CredentialServiceConfig _config;

        public CredentialService(
            IConfiguration config,
            IMattrClient client,
            IShortenUrlService shortenUrl,
            ILogger<CredentialService> logger
        )
        {
            _config = new CredentialServiceConfig(config);
            _mattr = client;
            _shortenUrl = shortenUrl;
            _logger = logger;
        }

        public async Task<DirectCredentialResponse> CreateDirectCredentialOffer(
            string subjectDid,
            string messagingDid,
            Credential<object> credential
        )
        {
            _logger.LogInformation("CreateDirectCredentialOffer {subjectDid} {messagingDid}", subjectDid, messagingDid);
            var issuer = await _mattr.GetDid(messagingDid);

            var issuerDidUrl = Guard.Against.Null(
                issuer.LocalMetadata?.InitialDidDocument?.KeyAgreement[0]?.Id,
                message: "Cannot resolve issuer encryption key"
            );
            var response = await _mattr.CreateDirectCredentialOffer(new DirectCredentialOfferRequest<CredentialSubject>
            {
                SubjectDid = subjectDid,
                IssuerDidUrl = issuerDidUrl,
                Credential = credential,
                Domain = _config.Tenant
            });

            var didCommUrl = _shortenUrl.CreateDidCommUri(response.Jwe);

            return new DirectCredentialResponse
            {
                Uid = Guid.NewGuid(),
                Jwe = response.Jwe,
                DeepLink = didCommUrl.ToMattrDeepLink(_config.MobileWalletBundleId),
                DidComm = didCommUrl
            };
        }

        public async Task<CreateCredentialResponse<CredentialSubject>> CreateCredential(Api.CreateCredential create)
        {
            _logger.LogInformation("CreateCredential");
            create.ClaimContent.Add("id", create.SubjectDid);

            var payload = new CredentialPayload<CredentialSubject>
            {
                Context = create.ClaimContext,
                Type = create.ClaimTypes,
                Issuer = new CredentialIssuer { Id = create.IssuerDid, Name = "Sample App" },
                CredentialSubject = new SortedDictionary<string, object>(create.ClaimContent)
            };

            var response = await _mattr.SignWebSemanticCredential(new CreateCredentialRequest<CredentialSubject>
            {
                Payload = payload
            });

            return response;
        }
    }
}
