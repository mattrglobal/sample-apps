using Mattr;
using MattrIssueDirect.Models.Api;

namespace MattrIssueDirect.Services
{
    public interface IMessageService
    {
        Task SendMessage(SendMessageRequest request);
    }

    public class MessageService : IMessageService
    {
        private readonly IMattrClient _mattr;

        public MessageService(IMattrClient client)
        {
            _mattr = client;
        }

        public async Task SendMessage(SendMessageRequest request)
        {
            await _mattr.SendMessage(new Mattr.Models.MessagingSendRequest
            {
                To = request.SubjectDid,
                Message = request.Message
            });
        }
    }
}
