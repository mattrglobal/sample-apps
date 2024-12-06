
using MattrIssueDirect.Models.Api;
using MattrIssueDirect.Services;
using Microsoft.AspNetCore.Mvc;

namespace MattrIssueDirect.Controllers
{
    [ApiController]
    [Route("messaging")]
    public class MessageController : ControllerBase
    {

        private readonly ILogger<MessageController> _logger;
        private readonly IMessageService _service;

        public MessageController(
            ILogger<MessageController> logger,
            IMessageService service
        )
        {
            _logger = logger;
            _service = service;
        }

        [HttpPost]
        [Route("send")]
        public async Task<IActionResult> SendMessage(SendMessageRequest request)
        {
            _logger.LogInformation("Send a message to {}", request.SubjectDid);
            await _service.SendMessage(request);

            return Ok();
        }
    }
}
