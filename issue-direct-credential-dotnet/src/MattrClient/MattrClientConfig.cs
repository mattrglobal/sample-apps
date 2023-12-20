public class MattrClientConfig
{
    public string Tenant { get; set; }
    public string AuthTenant { get; set; }
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }
    public string Audience { get; set; }
    public string GrantType { get; set; } = "client_credentials";
}

