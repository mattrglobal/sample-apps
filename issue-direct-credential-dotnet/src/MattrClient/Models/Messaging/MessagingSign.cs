

using Newtonsoft.Json;

namespace Mattr.Models
{
    public class MessagingSignRequest<T>
    {
        [JsonProperty("payload")]
        public T Payload { get; set; }

        [JsonProperty("didUrl")]
        public string DidUrl { get; set; }
    }

    public class MessagingSignPayload
    {
        [JsonProperty("msg")]
        public string Message { get; set; }
    }

    public class MessagingSignResponse
    {
        [JsonProperty("didUrl")]
        public string DidUrl { get; set; }

        [JsonProperty("payload")]
        public MessagingSignPayload Payload { get; set; }
    }
}
