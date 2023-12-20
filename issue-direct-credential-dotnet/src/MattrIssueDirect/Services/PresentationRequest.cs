using Ardalis.GuardClauses;
using Mattr;
using Mattr.Models;
using MattrIssueDirect.Utils;
using Api = MattrIssueDirect.Models.Api;

namespace MattrIssueDirect.Services
{
    public class PresentationServiceConfig
    {
        public PresentationServiceConfig(IConfiguration config)
        {
            Tenant = Guard.Against.Null(config.GetValue<string>("Mattr:Tenant"), message: "You must configure the Mattr.Tenant in the appsettings.json");
            NgrokUrl = Guard.Against.Null(config.GetValue<string>("Mattr:NgrokUrl"), message: "You must configure the Mattr.NgrokUrl in the appsettings.json");
            MobileWalletBundleId = config.GetValue<string>("Mattr:WalletBundleId") ?? "global.mattr.wallet";
        }

        public string Tenant { get; }
        public string NgrokUrl { get; }
        public string MobileWalletBundleId { get; set; }
    }

    public interface IPresentationService
    {
        Task<Api.PresentationResponse> CreatePresentationRequest(Api.PresentationRequest request);

        public bool VerifyPresentationCallback(Api.PresentationCallBack request);
    }

    public class PresentationService : IPresentationService
    {
        private readonly PresentationServiceConfig _config;
        private readonly ILogger _logger;
        private readonly IMattrClient _mattr;
        private readonly IShortenUrlService _shortUrl;

        // Not thread safe so be careful
        private static readonly HashSet<Guid> _challenges = new HashSet<Guid>();

        public PresentationService(
            IShortenUrlService shortenUrl,
            IConfiguration config,
            IMattrClient client,
            ILogger<PresentationService> logger
        )
        {
            _shortUrl = shortenUrl;
            _config = new PresentationServiceConfig(config);
            _mattr = client;
            _logger = logger;
        }

        public async Task<Api.PresentationResponse> CreatePresentationRequest(Api.PresentationRequest request)
        {
            var challengeId = Guid.NewGuid();
            var did = await _mattr.GetDid(request.MessagingDid);
            var didUrl = Guard.Against.Null(did?.DidDocument.Authentication?[0]);

            var template = await _mattr.CreateWebSemanticPresentationTemplate(new PresentationTemplateRequest<DidAuthQuery>
            {
                Domain = _config.Tenant,
                Name = $"sample_direct_credential_didauth_request:{challengeId}",
                Query = [new DidAuthQuery()]
            });

            _logger.LogInformation("Create Presentation for messaging DID {Did} Challenge {}", request.MessagingDid, challengeId.ToString());
            var presentation = await _mattr.CreatePresentationRequest(new PresentationRequest
            {
                Challenge = challengeId.ToString(),
                Did = request.MessagingDid,
                TemplateId = template.TemplateId,
                // We've setup a callback or redirect to the same service running on localhost
                CallbackUrl = $"{_config.NgrokUrl}/presentations/callback"
            });

            _challenges.Add(challengeId);
            var signed = await _mattr.SignMessage(new MessagingSignRequest<object>
            {
                Payload = Guard.Against.Null(presentation.Request, "Failed to create presentation request"),
                DidUrl = didUrl
            });

            var didCommUrl = _shortUrl.CreateDidCommUri(signed);

            _logger.LogInformation("DIDCOMM URL {didcomm}", didCommUrl);

            return new Api.PresentationResponse
            {
                Uid = Guid.NewGuid(),
                Jws = Guard.Against.Null(signed, "Failed to sign message contents", nameof(signed)),
                DeepLink = didCommUrl.ToMattrDeepLink(_config.MobileWalletBundleId),
                DidComm = didCommUrl
            };
        }

        public bool VerifyPresentationCallback(Api.PresentationCallBack request)
        {
            if (!request.Verified || request.Holder.Length == 0)
            {
                _logger.LogError("VerifyPresentationCallback DIDAuth request failed {verified} {holder}", request.Verified, request.Holder);
                return false;
            }

            if (!_challenges.Contains(request.ChallengeId))
            {
                _logger.LogError("VerifyPresentationCallback DIDAuth challenge failed {challenge}", request.ChallengeId);
                return false;
            }

            _logger.LogInformation("VerifyPresentationCallback DIDAuth verified successfully");

            // Remove challenge so it cannot be reused
            _challenges.Remove(request.ChallengeId);

            return true;
        }

    }
}
