
using Newtonsoft.Json;

namespace Mattr.Models
{
    public class Key
    {
        [JsonProperty("didDocumentKeyId")]
        public string DidDocumentKeyId { get; set; }

        [JsonProperty("kmsKeyId")]
        public string KmsKeyId { get; set; }
    }

    public class KeyAgreement
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("controller")]
        public string Controller { get; set; }

        [JsonProperty("publicKeyBase58")]
        public string PublicKeyBase58 { get; set; }
    }

    public class LocalMetadata
    {
        [JsonProperty("keys")]
        public List<Key> Keys { get; set; }

        [JsonProperty("registered")]
        public long Registered { get; set; }

        [JsonProperty("initialDidDocument")]
        public DidDocument InitialDidDocument { get; set; }
    }

    public class VerificationMethod
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("controller")]
        public string Controller { get; set; }

        [JsonProperty("publicKeyBase58")]
        public string PublicKeyBase58 { get; set; }
    }

    public class DidDocument
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("@context")]
        public string[] Context { get; set; }

        [JsonProperty("authentication")]
        public IReadOnlyList<string> Authentication { get; set; }

        [JsonProperty("verificationMethod")]
        public List<VerificationMethod> VerificationMethod { get; set; }

        [JsonProperty("assertionMethod")]
        public List<string> AssertionMethod { get; set; }

        [JsonProperty("capabilityDelegation")]
        public List<string> CapabilityDelegation { get; set; }

        [JsonProperty("capabilityInvocation")]
        public List<string> CapabilityInvocation { get; set; }

        [JsonProperty("keyAgreement")]
        public List<KeyAgreement> KeyAgreement { get; set; }
    }

    public class DidResponse
    {
        [JsonProperty("didDocument")]
        public DidDocument DidDocument { get; set; }

        [JsonProperty("registrationStatus")]
        public string RegistrationStatus { get; set; }

        [JsonProperty("localMetadata")]
        public LocalMetadata LocalMetadata { get; set; }
    }
}
