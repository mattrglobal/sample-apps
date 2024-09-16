
using Newtonsoft.Json;

namespace Mattr.Models
{
    public class DomainConfig
    {
        [JsonProperty("domain")]
        public string Domain { get; set; }
    }
}
