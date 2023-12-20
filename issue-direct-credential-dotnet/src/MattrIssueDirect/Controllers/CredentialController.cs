using MattrIssueDirect.Models.Api;
using MattrIssueDirect.Services;
using Microsoft.AspNetCore.Mvc;

namespace MattrIssueDirect.Controllers
{
    [ApiController]
    [Route("credentials")]
    public class CredentialController : ControllerBase
    {
        private readonly ICredentialService _service;

        public CredentialController(ICredentialService service)
        {
            _service = service;
        }

        [HttpPost]
        [Route("issue")]
        public async Task<IActionResult> CreateCredential(CreateCredential request)
        {
            var credential = await _service.CreateCredential(request);
            var offer = await _service.CreateDirectCredentialOffer(
                subjectDid: request.SubjectDid,
                messagingDid: request.MessagingDid,
                credential: credential.Credential
            );

            return Ok(offer);
        }

    }
}
