using Newtonsoft.Json;

namespace Mattr.Models
{
    public class MessagingEncryptDirectCredential<T>
    {
        [JsonProperty("domain")]
        public string Domain { get; set; }

        [JsonProperty("credentials")]
        public IReadOnlyList<Credential<T>> Credentials { get; set; }
    }

    public class MessagingEncryptPayload<T>
    {

        [JsonProperty("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonProperty("to")]
        public IReadOnlyList<string> To { get; set; }

        [JsonProperty("from")]
        public string From { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        [JsonProperty("created_time")]
        public long CreatedTime { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        [JsonProperty("body")]
        public T Body { get; set; }
    }

    public class MessagingEncryptRequest<T>
    {
        [JsonProperty("senderDidUrl")]
        public string SenderDidUrl { get; set; }

        [JsonProperty("recipientDidUrls")]
        public IReadOnlyList<string> RecipientDidUrls { get; set; }

        [JsonProperty("payload")]
        public MessagingEncryptPayload<T> Payload { get; set; }
    }

    public class MessagingEncryptResponse
    {

        [JsonProperty("jwe")]
        public MessageJwe Jwe { get; set; }
    }
}
