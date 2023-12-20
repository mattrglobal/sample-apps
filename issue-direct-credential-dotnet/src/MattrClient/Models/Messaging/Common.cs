using Newtonsoft.Json;

namespace Mattr.Models
{
    public class Epk
    {
        [JsonProperty("kty")]
        public string Kty { get; set; }

        [JsonProperty("crv")]
        public string Crv { get; set; }
        [JsonProperty("x")]
        public string X { get; set; }
    }

    public class MessageJweRecipientHeader
    {
        [JsonProperty("alg")]
        public string Alg { get; set; }

        [JsonProperty("kid")]
        public string Kid { get; set; }

        [JsonProperty("epk")]
        public Epk Epk { get; set; }

        [JsonProperty("skid")]
        public string Skid { get; set; }
    }

    public class MessageJweRecipient
    {
        [JsonProperty("header")]
        public MessageJweRecipientHeader Header { get; set; }

        [JsonProperty("encrypted_key")]
        public string EncryptionKey { get; set; }
    }

    public class MessageJwe
    {
        [JsonProperty("protected")]
        public string Protected { get; set; }

        [JsonProperty("recipients")]
        public IReadOnlyList<MessageJweRecipient> Recipients { get; set; }

        [JsonProperty("ciphertext")]
        public string Ciphertext { get; set; }

        [JsonProperty("iv")]
        public string Iv { get; set; }

        [JsonProperty("tag")]
        public string Tag { get; set; }
    }
}
