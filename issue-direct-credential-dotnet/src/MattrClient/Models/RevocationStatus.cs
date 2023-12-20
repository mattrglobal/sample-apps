using Newtonsoft.Json;


namespace Mattr.Models
{
    public class RevocationStatus
    {

        [JsonProperty("isRevoked")]
        public bool IsRevoked { get; set; }
    }

    public class RevocationStatusRequest
    {
        public Guid Id { get; set; }
        public bool IsRevoked { get; set; }
    }
}
