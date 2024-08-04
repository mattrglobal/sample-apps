
using Newtonsoft.Json;

namespace Mattr.Models
{
    public class PresentationRequest
    {
        [JsonProperty("challenge")]
        public string Challenge { get; set; }

        [JsonProperty("did")]
        public string Did { get; set; }

        [JsonProperty("templateId")]
        public string TemplateId { get; set; }

        [JsonProperty("callbackUrl")]
        public string CallbackUrl { get; set; }
    }

    public class PresentationRequestResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("from")]
        public string From { get; set; }

        [JsonProperty("created_time")]
        public long CreatedTime { get; set; }

        [JsonProperty("expires_time")]
        public long ExpiresTime { get; set; }

        [JsonProperty("reply_url")]
        public string ReplyUrl { get; set; }

        [JsonProperty("reply_to")]
        public IReadOnlyList<string> ReplyTo { get; set; }

        [JsonProperty("body")]
        public object Body { get; set; }
    }

    public class PresentationResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("callbackUrl")]
        public string CallbackUrl { get; set; }

        [JsonProperty("request")]
        public PresentationRequestResponse Request { get; set; }

        [JsonProperty("didcommUri")]
        public string DidCommUri { get; set; }
    }
}
