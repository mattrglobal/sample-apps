using Newtonsoft.Json;

namespace MattrIssueDirect.Models.Api
{
    public class Presentation
    {
        [JsonProperty("@context")]
        public List<string> Context { get; set; }

        [JsonProperty("type")]
        public List<string> Type { get; set; }

        [JsonProperty("holder")]
        public string Holder { get; set; }

        [JsonProperty("proof")]
        public List<PresentationProof> Proof { get; set; }
    }

    public class PresentationProof
    {
        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("created")]
        public DateTime Created { get; set; }

        [JsonProperty("verificationMethod")]
        public string VerificationMethod { get; set; }

        [JsonProperty("proofPurpose")]
        public string ProofPurpose { get; set; }

        [JsonProperty("challenge")]
        public string Challenge { get; set; }

        [JsonProperty("domain")]
        public string Domain { get; set; }

        [JsonProperty("jws")]
        public string Jws { get; set; }
    }

    public class PresentationCallBack
    {
        [JsonProperty("presentationType")]
        public string PresentationType { get; set; }

        [JsonProperty("challengeId")]
        public Guid ChallengeId { get; set; }

        [JsonProperty("claims")]
        public object Claims { get; set; }

        [JsonProperty("verified")]
        public bool Verified { get; set; }

        [JsonProperty("holder")]
        public string Holder { get; set; }

        [JsonProperty("presentation")]
        public Presentation Presentation { get; set; }
    }
}
