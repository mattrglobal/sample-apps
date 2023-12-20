
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace MattrIssueDirect.Models.Api
{
    public class PresentationRequest
    {
        [JsonProperty("messagingDid")]
        public string MessagingDid { get; set; }
    }

    public class PresentationResponse
    {
        [JsonProperty("uid")]
        public Guid Uid { get; set; }

        [JsonProperty("jws")]
        public string Jws { get; set; }

        [JsonProperty("deeplink")]
        public string DeepLink { get; set; }

        [JsonProperty("didcomm")]
        public string DidComm { get; set; }
    }

    public class VerifiedPresentation
    {
        [JsonProperty("data")]
        public string SubjectDid { get; set; }
    }
}
