using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;

            logger.LogInformation("Handling {RequestName} {@Request}", requestName, request);

            var stopwatch = Stopwatch.StartNew();

            try
            {
                var response = await next();
                stopwatch.Stop();

                if (stopwatch.ElapsedMilliseconds > 500)
                {
                    logger.LogWarning("Long Running Request: {RequestName} took {ElapsedMilliseconds} ms",
                        requestName, stopwatch.ElapsedMilliseconds);
                }
                else
                {
                    logger.LogInformation("Handled {RequestName} in {ElapsedMilliseconds} ms",
                        requestName, stopwatch.ElapsedMilliseconds);
                }

                return response;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                logger.LogError(ex, "Request Failure: {RequestName} failed after {ElapsedMilliseconds} ms",
                    requestName, stopwatch.ElapsedMilliseconds);
                throw;
            }
        }
    }
}
