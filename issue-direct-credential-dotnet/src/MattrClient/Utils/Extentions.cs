using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace Mattr.Utils
{
    public static class Extensions
    {
        public static Task<HttpResponseMessage> SendRequestAsync(
            this HttpClient client,
            string uri,
            HttpMethod method,
            HttpContent content = null,
            string token = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            var request = new HttpRequestMessage
            {
                Method = method,
                RequestUri = new Uri(string.Format("{0}{1}", client.BaseAddress, uri)),
                Content = content,
            };

            if (request.Content?.Headers?.ContentType != null)
            {
                // Need to override overwise we get a 415 from MATTR
                request.Content.Headers.ContentType.CharSet = "";
            }

            if (!string.IsNullOrWhiteSpace(token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            return client.SendAsync(request, cancel);
        }

        public static async Task<HttpResponseMessage> SendJsonAsync<T>(
            this HttpClient client,
            HttpMethod method,
            string uri,
            T value,
            string token = null,
            JsonSerializerSettings options = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            return await client.SendRequestAsync(
                uri: uri,
                method: method,
                content: IntoJsonContent(value, options),
                token: token,
                cancel: cancel
            );
        }

        public static Task<HttpResponseMessage> DeleteRequestAsync(
            this HttpClient client,
            string uri,
            string token = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            return client.SendRequestAsync(
                method: HttpMethod.Delete,
                uri: uri,
                token: token,
                cancel: cancel
            );
        }

        public static Task<HttpResponseMessage> GetRequestAsync(
            this HttpClient client,
            string uri,
            string token = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            return client.SendRequestAsync(
                method: HttpMethod.Get,
                uri: uri,
                token: token,
                cancel: cancel
            );
        }

        public static Task<HttpResponseMessage> PostRequestJsonAsync<T>(
            this HttpClient client,
            string uri,
            T body,
            JsonSerializerSettings options,
            string token = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            return client.SendJsonAsync(HttpMethod.Post, uri, body, token, options, cancel);
        }

        public static HttpContent IntoJsonContent<T>(
            T value,
            JsonSerializerSettings options = null
        )
        {
            var body = JsonConvert.SerializeObject(value, options);
            return new StringContent(body, null, "application/json");
        }

        public static async Task<T> ReadJson<T>(
            this HttpContent content,
            JsonSerializerSettings options = null,
            CancellationToken cancel = new CancellationToken()
        )
        {
            var data = await content.ReadAsStringAsync(cancel);
#pragma warning disable CS8603
            // Possible null reference return.
            // We want the caller to decide and we can't use ? null operator because of backwards compatibility
            return JsonConvert.DeserializeObject<T>(data, options);
#pragma warning restore CS8603
        }

        public static string ToBase64(
            this string value
        )
        {
            var strBytes = System.Text.Encoding.UTF8.GetBytes(value);
            return System.Convert.ToBase64String(strBytes);
        }

        public static string ToMattrDeepLink(
            this string didCommUrl,
            string walletBundleId = "mattr.global"
        ) => string.Format("{0}://accept/{1}", walletBundleId, didCommUrl.ToBase64());
    }
}
