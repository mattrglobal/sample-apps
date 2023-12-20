
using Ardalis.GuardClauses;
using Microsoft.AspNetCore.Mvc;

namespace MattrIssueDirect.Controllers
{
    [ApiController]
    public class ShortUrlController : ControllerBase
    {
        private readonly IShortenUrlService _service;

        public ShortUrlController(IShortenUrlService service)
        {
            _service = service;
        }

        [HttpGet]
        [Route("/resolve/{id}")]
        public IActionResult ResolveShortUrl(Guid id)
        {
            var resolved = _service.ResolveDidCommUri(id);
            Guard.Against.Null(resolved);

            // Redirect the request to the full url in this case the tenant
            switch (resolved.Type)
            {
                case ShortDataType.Url:
                    return RedirectPermanent(resolved.Value);
                case ShortDataType.Base64:
                    return Ok(resolved.Value);
                default:
                    throw new NotImplementedException();
            }
        }
    }
}
