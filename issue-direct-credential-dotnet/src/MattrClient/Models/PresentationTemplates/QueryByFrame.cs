using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mattr.Models
{
    public class Frame
    {
        [JsonProperty("@context")]
        public IReadOnlyList<string> Context { get; set; }

        [JsonProperty("type")]
        public IReadOnlyList<string> Type { get; set; }

        [JsonProperty("credentialSubject")]
        public object CredentialSubject { get; set; }
    }

    public class CredentialFrameQuery
    {
        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("frame")]
        public Frame Frame { get; set; }

        [JsonProperty("trustedIssuer")]
        public TrustedIssuer TrustedIssuer { get; set; }
    }

    public class QueryByFrame : IQueryTypeBase
    {
        [JsonProperty("type")]
        public string Type { get; } = "QueryByFrame";

        [JsonProperty("credentialQuery")]
        public IReadOnlyList<CredentialFrameQuery> CredentialQuery { get; set; }
    }
}
