namespace Mattr.Models
{

    public class DirectCredentialOfferRequest<T>
    {
        public string Domain { get; set; }

        public string SubjectDid { get; set; }

        // did.LocalMetadata?.InitialDidDocument?.KeyAgreement[0]?.Id
        public string IssuerDidUrl { get; set; }

        public Credential<T> Credential { get; set; }
    }
}
