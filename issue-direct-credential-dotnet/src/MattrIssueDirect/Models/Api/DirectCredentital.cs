using Newtonsoft.Json;

namespace MattrIssueDirect.Models.Api
{
    public class DirectCredentialResponse
    {
        [JsonProperty("uid")]
        public Guid Uid { get; set; }

        [JsonProperty("jwe")]
        public object Jwe { get; set; }

        [JsonProperty("deeplink")]
        public string DeepLink { get; set; }

        [JsonProperty("didcomm")]
        public string DidComm { get; set; }
    }
}
