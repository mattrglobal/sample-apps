using Ardalis.GuardClauses;

namespace MattrIssueDirect.Models
{

    public class ViewDefaults
    {
        public ViewDefaults(string issuerDid)
        {
            MessagingDid = issuerDid;
            IssuerDid = issuerDid;
        }

        public string MessagingDid { get; }
        public string IssuerDid { get; }
    }
}
