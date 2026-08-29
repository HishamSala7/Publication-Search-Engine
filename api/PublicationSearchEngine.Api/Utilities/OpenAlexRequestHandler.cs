using System.Web;
using Microsoft.Extensions.Options;
using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Api.Utilities;

public class OpenAlexRequestHandler : DelegatingHandler
{
    private readonly OpenAlexRequestConfiguration _options;

    public OpenAlexRequestHandler(IOptions<OpenAlexRequestConfiguration> options)
    {
        _options = options.Value;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var uriBuilder = new UriBuilder(request.RequestUri!);
        var query = HttpUtility.ParseQueryString(uriBuilder.Query);

        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            query["api_key"] = _options.ApiKey;

        if (!string.IsNullOrWhiteSpace(_options.MailTo))
            query["mailto"] = _options.MailTo;

        uriBuilder.Query = query.ToString();
        request.RequestUri = uriBuilder.Uri;

        return base.SendAsync(request, cancellationToken);
    }
}
