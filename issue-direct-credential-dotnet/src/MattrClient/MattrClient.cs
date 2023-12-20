
using System.Collections.Immutable;
using System.Net.Http.Headers;
using Ardalis.GuardClauses;
using Mattr.Models;
using Mattr.Utils;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mattr
{

    public class MattrClient : IMattrClient
    {
        private readonly HttpClient _client;
        private readonly MattrClientConfig _config;
        private readonly JsonSerializerSettings _jsonConfig;
        private DateTime _tokenExp;
        private AuthTokenResponse _authToken;
        private readonly SemaphoreSlim _authLock = new SemaphoreSlim(1, 1);

        public MattrClient(HttpClient client, MattrClientConfig config)
        {
            client.BaseAddress = new Uri(string.Format("https://{0}/", config.Tenant));
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Default JSON settings
            var settings = new JsonSerializerSettings()
            {
                // Avoid dangling null's
                NullValueHandling = NullValueHandling.Ignore,
                // Avoids sending defaults i.e DateTime.MinValue
                DefaultValueHandling = DefaultValueHandling.Ignore
            };

            settings.Converters.Add(new IsoDateTimeConverter
            {
                // Use a consistent format for any DateTimes
                DateTimeFormat = "yyyy-MM-ddTHH:mm:ss.fffZ"
            });

            // Enable PascalCase string enums
            settings.Converters.Add(new StringEnumConverter());

            _config = config;
            _jsonConfig = settings;
            _client = client;
            _tokenExp = DateTime.UtcNow;
        }

        public async Task<DomainConfig> GetTenantDomain(CancellationToken cancel = new CancellationToken())
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.GetRequestAsync(
                uri: "core/v1/config/domain",
                token: token.AccessToken,
                cancel: cancel
            );

            EnsureSuccessStatusCode("Failed to retrieve tenant domain", response);

            var tenantDomain = await response.Content.ReadJson<DomainConfig>(_jsonConfig, cancel);
            return Guard.Against.Null(tenantDomain);
        }

        public async Task<PresentationTemplateResponse> CreateWebSemanticPresentationTemplate<T>(
            PresentationTemplateRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        ) where T : IQueryTypeBase
        {

            var token = await GetAccessToken(cancel);
            var response = await _client.PostRequestJsonAsync(
                uri: "v2/credentials/web-semantic/presentations/templates",
                body: request,
                token: token.AccessToken,
                cancel: cancel,
                options: _jsonConfig
            );

            EnsureSuccessStatusCode("Failed to create web semantic presentation template", response);

            var template = await response.Content.ReadJson<PresentationTemplateResponse>(_jsonConfig, cancel);

            return Guard.Against.Null(template, message: "Failed to create web semantic presentation template");
        }

        public async Task<DidResponse> GetDid(string did, CancellationToken cancel = new CancellationToken())
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.GetRequestAsync(
                uri: string.Format("v1/dids/{0}", did),
                token: token.AccessToken,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to retrieve did", response);

            var didResponse = await response.Content.ReadJson<DidResponse>(_jsonConfig, cancel);

            return Guard.Against.Null(didResponse, message: "Failed to retrieve DID");
        }

        public async Task<PresentationResponse> CreatePresentationRequest(PresentationRequest request, CancellationToken cancel = new CancellationToken())
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.PostRequestJsonAsync(
                uri: "v2/credentials/web-semantic/presentations/requests",
                body: request,
                token: token.AccessToken,
                options: _jsonConfig,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to create presentation template", response);

            var data = await response.Content.ReadJson<PresentationResponse>(_jsonConfig, cancel);
            return Guard.Against.Null(data);
        }

        public async Task<MessagingEncryptResponse> CreateDirectCredentialOffer<T>(
            DirectCredentialOfferRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        )
        {
            if (!request.IssuerDidUrl.Contains('#'))
            {
                var name = nameof(request.IssuerDidUrl);
                throw new ArgumentException(string.Format("Invalid '{0}' provided", name), name);
            }

            var messagingDid = request.IssuerDidUrl.Split("#")[0];
            var to = new List<string>() { request.SubjectDid }.ToImmutableArray();

            var body = new MessagingEncryptDirectCredential<T>
            {
                Domain = request.Domain,
                Credentials = new List<Credential<T>>() { request.Credential }
            };

            var payload = new MessagingEncryptPayload<MessagingEncryptDirectCredential<T>>
            {
                To = to,
                From = messagingDid,
                Type = "https://mattr.global/schemas/verifiable-credential/offer/Direct",
                Body = body
            };

            return await EncryptMessage(
                senderDidUrl: request.IssuerDidUrl,
                recipientDidUrls: to,
                payload: payload,
                cancel: cancel
            );
        }

        public async Task DeletePresentationTemplate(Guid id, CancellationToken cancel = new CancellationToken())
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.DeleteRequestAsync(
                uri: string.Format("v2/credentials/web-semantic/presentations/templates/{0}", id),
                token: token.AccessToken,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to delete presentation template", response);
        }

        public async Task<CreateCredentialResponse<T>> SignWebSemanticCredential<T>(CreateCredentialRequest<T> request, CancellationToken cancel = new CancellationToken())
        {
            var token = await GetAccessToken(cancel);

            var response = await _client.PostRequestJsonAsync(
                uri: "v2/credentials/web-semantic/sign",
                body: request,
                token: token.AccessToken,
                options: _jsonConfig,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to sign web semantic credential", response);

            var data = await response.Content.ReadJson<CreateCredentialResponse<T>>(_jsonConfig, cancel);
            return Guard.Against.Null(data);
        }

        public async Task<RevocationStatus> RevocationStatusWebSemantic(RevocationStatusRequest request, CancellationToken cancel = default)
        {
            var token = await GetAccessToken(cancel);

            var response = await _client.PostRequestJsonAsync(
                uri: string.Format("v2/credentials/web-semantic/{0}/revocation-status", request.Id),
                body: new RevocationStatus { IsRevoked = request.IsRevoked },
                token: token.AccessToken,
                options: _jsonConfig,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to update semantic credentials revocation status", response);

            var data = await response.Content.ReadJson<RevocationStatus>(_jsonConfig, cancel);
            return Guard.Against.Null(data);
        }
        public async Task SendMessage(
            MessagingSendRequest request,
            CancellationToken cancel = new CancellationToken()
        )
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.PostRequestJsonAsync(
                uri: "core/v1/messaging/send",
                body: request,
                token: token.AccessToken,
                options: _jsonConfig,
                cancel: cancel
            );

            EnsureSuccessStatusCode("Failed to send message", response);
        }

        public async Task<string> SignMessage<T>(
            MessagingSignRequest<T> request,
            CancellationToken cancel = new CancellationToken()
        )
        {
            var token = await GetAccessToken(cancel);
            var response = await _client.PostRequestJsonAsync(
                uri: "core/v1/messaging/sign",
                body: request,
                token: token.AccessToken,
                options: _jsonConfig,
                cancel: cancel
            );
            EnsureSuccessStatusCode("Failed to sign message", response);

            var messageSign = await response.Content.ReadJson<string>(_jsonConfig, cancel);

            return Guard.Against.Null(messageSign, message: "Failed to Sign Message");
        }

        public async Task<MessagingEncryptResponse> EncryptMessage<T>(
            string senderDidUrl,
            IReadOnlyList<string> recipientDidUrls,
            MessagingEncryptPayload<T> payload,
            CancellationToken cancel = new CancellationToken()
        )
        {
            var token = await GetAccessToken(cancel);

            var body = new MessagingEncryptRequest<T>
            {
                SenderDidUrl = senderDidUrl,
                RecipientDidUrls = recipientDidUrls.ToImmutableList(),
                Payload = payload
            };

            var response = await _client.PostRequestJsonAsync(
                uri: "core/v1/messaging/encrypt",
                token: token.AccessToken,
                body: body,
                options: _jsonConfig,
                cancel: cancel
            );

            EnsureSuccessStatusCode("Failed to encrypt message", response);

            var encrypted = await response.Content.ReadJson<MessagingEncryptResponse>(_jsonConfig, cancel);

            return Guard.Against.Null(encrypted, message: "Failed to encrypt Message");
        }

        private void EnsureSuccessStatusCode(
            string message,
            HttpResponseMessage response
        )
        {
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            throw new MattrApiException(message, response);
        }

        private bool IsTokenExpired()
        {
#pragma warning disable CS8073, S2589
            // The '_tokenExp == null' expression is always false should never be null just being cautious as we mutate.
            return _authToken == null || _tokenExp == null || DateTime.UtcNow > _tokenExp;
#pragma warning restore CS8073, S2589
        }

        public async Task<AuthTokenResponse> GetAccessToken(CancellationToken cancel = new CancellationToken())
        {
            // Lock for thread safety to help avoid invalidating tokens in flight
            await _authLock.WaitAsync(cancel);

            if (!IsTokenExpired())
            {
                _authLock.Release();
                return _authToken;
            }

            try
            {
                var body = new AuthTokenRequest
                {
                    ClientId = _config.ClientId,
                    ClientSecret = _config.ClientSecret,
                    Audience = _config.Audience,
                    GrantType = _config.GrantType ?? "client_credentials"
                };

                var response = await _client.PostAsync(
                    requestUri: string.Format("{0}/oauth/token", _config.AuthTenant),
                    content: Extensions.IntoJsonContent(body),
                    cancel
                );

                EnsureSuccessStatusCode("Failed to retrieve access_token", response);

                var data = await response.Content.ReadJson<AuthTokenResponse>(cancel: cancel);
                Guard.Against.Null(data?.AccessToken);

                // set the token expiry with a 5min buffer
                _tokenExp = DateTime.UtcNow.AddSeconds(data.ExpiresIn).AddMinutes(-5);
                // Update the client's token value
                _authToken = data;

                return Guard.Against.Null(data, message: "Failed to retrieve access_token");

            }
            finally
            {
                // Always release the lock
                _authLock.Release();
            }
        }
    }
}
