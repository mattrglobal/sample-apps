namespace MattrIssueDirect.Utils
{
    public static class Extensions
    {
        public static string ToBase64(
            this string value
        )
        {
            var strBytes = System.Text.Encoding.UTF8.GetBytes(value);
            return Convert.ToBase64String(strBytes);
        }

        public static string ToMattrDeepLink(
            this string didCommUrl,
            string walletBundleId = "mattr.global"
        ) => $"{walletBundleId}://accept/{didCommUrl.ToBase64()}";
    }
}
