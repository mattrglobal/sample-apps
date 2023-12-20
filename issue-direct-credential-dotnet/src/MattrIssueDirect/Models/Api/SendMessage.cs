
using Mattr.Models;
using Newtonsoft.Json;

namespace MattrIssueDirect.Models.Api
{
    public class SendMessageRequest
    {
        [JsonProperty("subjectDid")]
        public string SubjectDid { get; set; }

        [JsonProperty("message")]
        public MessageJwe Message { get; set; }
    }

}
