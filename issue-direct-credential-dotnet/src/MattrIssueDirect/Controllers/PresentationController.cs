using MattrIssueDirect.Models.Api;
using MattrIssueDirect.Services;
using Microsoft.AspNetCore.Mvc;

namespace MattrIssueDirect.Controllers
{
    [Route("/presentations")]
    [ApiController]
    public class PresentationController : ControllerBase
    {
        private readonly ILogger<PresentationController> _logger;
        private readonly IPresentationService _service;
        private static readonly Dictionary<Guid, VerifiedPresentation> _validPresentations = new Dictionary<Guid, VerifiedPresentation>();

        public PresentationController(
            ILogger<PresentationController> logger,
            IPresentationService service
        )
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        [Route("request")]
        public async Task<IActionResult> CreatePresentationRequest(PresentationRequest request)
        {
            _logger.LogInformation("Create presentation for {messagingDid}", request.MessagingDid);
            var response = await _service.CreatePresentationRequest(request);

            return Ok(response);
        }

        [HttpPost]
        [Route("callback")]
        public IActionResult PresentationCallback(PresentationCallBack request)
        {
            _logger.LogInformation("/presentations/callback");
            var success = _service.VerifyPresentationCallback(request);

            if (success)
            {
                _validPresentations.Add(request.ChallengeId, new VerifiedPresentation { SubjectDid = request.Holder });
            }

            // TODO: Check the response types I can send based on validation
            return Ok();
        }

        [HttpGet]
        [Route("{id}")]
        public IActionResult Presentations(Guid id)
        {
            _logger.LogInformation("/presentations/{id}/response", id);
            var verified = _validPresentations.GetValueOrDefault(id);
            return Ok(verified);
        }

    }
}
