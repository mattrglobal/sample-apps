using Ardalis.GuardClauses;
using MattrIssueDirect.Utils;
using Newtonsoft.Json;

public enum ShortDataType
{
    Url = 1,
    Base64 = 2
}

public class ShortData
{
    public ShortDataType Type { get; set; }
    public string Value { get; set; }
}

public interface IShortenUrlService
{
    string CreateDidCommUri(string jws);
    string CreateDidCommUri(object jwe);
    ShortData? ResolveDidCommUri(Guid id);
}

public class ShortenUrlService : IShortenUrlService
{
    private readonly string _serviceUri;
    private readonly string _tenant;
    private readonly ILogger<IShortenUrlService> _logger;

    // Not thread safe so be careful
    private static readonly Dictionary<Guid, ShortData> _urlCache = new Dictionary<Guid, ShortData>();

    public ShortenUrlService(
        IConfiguration config,
        ILogger<ShortenUrlService> logger
    )
    {
        _serviceUri = Guard.Against.Null(config.GetValue<string>("Mattr:NgrokUrl"), message: "You must configure the Mattr.NgrokUrl in the appsettings.json");
        _tenant = Guard.Against.Null(config.GetValue<string>("Mattr:Tenant"), message: "You must configure the Mattr.NgrokUrl in the appsettings.json");
        _logger = logger;
    }

    public string CreateDidCommUri(string jws)
    {
        var id = Guid.NewGuid();
        var entry = new ShortData
        {
            Type = ShortDataType.Url,
            Value = $"https://{_tenant}?request={jws}"
        };

        _logger.LogInformation("CreateDidCommUri for url {id}:{url}", id, entry.Value);
        _urlCache.Add(id, entry);

        return IntoDidCommUri(id);
    }

    public ShortData? ResolveDidCommUri(Guid id)
    {
        _logger.LogInformation("ResolveDidCommUri {id}", id);
        _urlCache.TryGetValue(id, out var value);
        return value;
    }

    public string CreateDidCommUri(object jwe)
    {
        var id = Guid.NewGuid();
        _logger.LogInformation("CreateDidCommUri for object {id}", id);

        var entry = new ShortData
        {
            Type = ShortDataType.Base64,
            Value = JsonConvert.SerializeObject(jwe).ToBase64()
        };

        _logger.LogDebug("CreateDidCommUri for object {id}:{obj}", id, entry.Value);
        _urlCache.Add(id, entry);

        return IntoDidCommUri(id);
    }

    private string IntoDidCommUri(Guid id)
    {
        return $"didcomm://{_serviceUri}/resolve/{id}";
    }

}
