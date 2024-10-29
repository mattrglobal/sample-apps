using Newtonsoft.Json;

namespace MattrIssueDirect.Models.Api
{
    public class CreateCredential
    {
        [JsonProperty("subjectDid")]
        public string SubjectDid { get; set; }

        [JsonProperty("issuerDid")]
        public string IssuerDid { get; set; }

        [JsonProperty("messagingDid")]
        public string MessagingDid { get; set; }

        [JsonProperty("claimTypes")]
        public IReadOnlyList<string> ClaimTypes { get; set; }

        [JsonProperty("claimContext")]
        public IReadOnlyList<string> ClaimContext { get; set; }

        [JsonProperty("claimContent")]
        public SortedDictionary<string, object> ClaimContent { get; set; }
    }

}
