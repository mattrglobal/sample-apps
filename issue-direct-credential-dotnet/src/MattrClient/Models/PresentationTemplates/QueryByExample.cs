
using Newtonsoft.Json;

namespace Mattr.Models
{
    public class QueryExample
    {
        [JsonProperty("@context")]
        public IReadOnlyList<string> Context { get; set; }

        [JsonProperty("type")]
        public IReadOnlyList<string> Type { get; set; }

        [JsonProperty("trustedIssuer")]
        public IReadOnlyList<TrustedIssuer> TrustedIssuer { get; set; }
    }

    public class CredentialExampleQuery
    {
        [JsonProperty("required")]
        public bool Required { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("example")]
        public IReadOnlyList<QueryByExample> Example { get; set; }
    }

    public class QueryByExample : IQueryTypeBase
    {
        [JsonProperty("type")]
        public string Type { get; } = "QueryByExample";

        [JsonProperty("credentialQuery")]
        public List<CredentialExampleQuery> CredentialQuery { get; set; }
    }
}
