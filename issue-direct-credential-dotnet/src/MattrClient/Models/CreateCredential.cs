using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mattr.Models
{
    public class CredentialIssuer
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("iconUrl")]
        public string IconUrl { get; set; }

        [JsonProperty("logoUrl")]
        public string LogoUrl { get; set; }
    }

    public interface ICredentialSubject
    {
        [JsonProperty("id")]
        public string Id { get; set; }
    }

    public class CredentialBranding
    {
        [JsonProperty("backgroundColor")]
        public string BackgroundColor { get; set; }

        [JsonProperty("watermarkImageUrl")]
        public string WatermarkImageUrl { get; set; }
    }

    public class CredentialPayload<T>
    {
        [JsonProperty("@context")]
        public IReadOnlyList<string> Context { get; set; }

        [JsonProperty("type")]
        public IReadOnlyList<string> Type { get; set; }

        [JsonProperty("issuer")]
        public CredentialIssuer Issuer { get; set; }

        [JsonProperty("credentialSubject")]
        public T CredentialSubject { get; set; }

        [JsonProperty("credentialBranding")]
        public CredentialBranding CredentialBranding { get; set; }

        [JsonProperty("expirationDate")]
        public DateTime ExpirationDate { get; set; }
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum ProofType
    {
        Ed25519Signature2018 = 1,
        BbsSignature2022 = 2,
    }

    public class CreateCredentialRequest<T>
    {
        [JsonProperty("payload")]
        public CredentialPayload<T> Payload { get; set; }

        // Optional
        [JsonProperty("proofType")]
        public ProofType ProofType { get; set; }

        [JsonProperty("tag")]
        public string Tag { get; set; } = null;

        [JsonProperty("persist")]
        public bool Persist { get; set; } = false;

        [JsonProperty("revocable")]
        public bool Revocable { get; set; } = false;
    }

    public class CredentialStatus
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("revocationListIndex")]
        public int RevocationListIndex { get; set; }

        [JsonProperty("revocationListCredential")]
        public string RevocationListCredential { get; set; }
    }

    public class CredentialProof
    {
        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("created")]
        public string Created { get; set; }

        [JsonProperty("jws")]
        public string Jws { get; set; }

        [JsonProperty("proofPurpose")]
        public string ProofPurpose { get; set; }

        [JsonProperty("verificationMethod")]
        public string VerificationMethod { get; set; }

        [JsonProperty("proofValue")]
        public string ProofValue { get; set; }
    }

    public class Credential<T>
    {
        [JsonProperty("@context")]
        public IReadOnlyList<string> Context { get; set; }

        [JsonProperty("type")]
        public IReadOnlyList<string> Type { get; set; }

        [JsonProperty("issuer")]
        public CredentialIssuer Issuer { get; set; }

        [JsonProperty("issuanceDate")]
        public DateTime IssuanceDate { get; set; }

        [JsonProperty("credentialStatus")]
        public CredentialStatus CredentialStatus { get; set; } = null;

        [JsonProperty("credentialSubject")]
        public T CredentialSubject { get; set; }

        [JsonProperty("proof")]
        public CredentialProof Proof { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }

    public class CreateCredentialResponse<T>
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("credential")]
        public Credential<T> Credential { get; set; }

        [JsonProperty("issuanceDate")]
        public DateTime IssuanceDate { get; set; }

        [JsonProperty("tag")]
        public string Tag { get; set; } = null;

        [JsonProperty("credentialStatus")]
        public CredentialStatus CredentialStatus { get; set; } = null;
    }
}
