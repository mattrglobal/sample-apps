using Newtonsoft.Json;

namespace Mattr.Models
{
    public class MessagingSendRequest
    {
        [JsonProperty("to")]
        public string To { get; set; }

        [JsonProperty("message")]
        public MessageJwe Message { get; set; }
    }
}
