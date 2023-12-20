namespace Mattr.Models
{
    public class MattrApiException : Exception
    {
        private HttpResponseMessage Response { get; }

        public MattrApiException(string message, HttpResponseMessage response) : base(message)
        {
            Response = response;
        }
    }
}
