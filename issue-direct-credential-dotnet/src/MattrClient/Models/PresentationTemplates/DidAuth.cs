

using Newtonsoft.Json;

namespace Mattr.Models
{
    public class DidAuthQuery : IQueryTypeBase
    {
        [JsonProperty("type")]
        public string Type { get; } = "DIDAuth";
    }
}
