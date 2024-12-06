
using Newtonsoft.Json;

namespace Mattr.Models
{
    public interface IQueryTypeBase
    {
        [JsonProperty("type")]
        string Type { get; }
    }

    public class PresentationTemplateRequest<T> where T : IQueryTypeBase
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("domain")]
        public string Domain { get; set; }

        [JsonProperty("query")]
        public List<T> Query { get; set; }
    }

    public class PresentationTemplateResponse
    {
        [JsonProperty("id")]
        public string TemplateId { get; set; }
    }

    public class TrustedIssuer
    {
        [JsonProperty("required")]
        public bool Required { get; set; }

        [JsonProperty("issuer")]
        public string Issuer { get; set; }
    }

}
