using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Multi_Vendor_Marketplace.Application.Common.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Middlewares
{
    public class CustomExceptionHandler(ILogger<CustomExceptionHandler> logger, IHostEnvironment env) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            var (statusCode, title, detail, errors) = exception switch
            {
                ValidationException validationEx => (
                    StatusCodes.Status400BadRequest,
                    "Validation Failed",
                    "One or more validation errors occurred.",
                    validationEx.Errors),

                ForbiddenAccessException forbiddenEx => (
                    StatusCodes.Status403Forbidden,
                    "Forbidden",
                    forbiddenEx.Message,
                    null),

                KeyNotFoundException notFoundEx => (
                    StatusCodes.Status404NotFound,
                    "Not Found",
                    notFoundEx.Message,
                    null),

                UnauthorizedAccessException unauthorizedEx => (
                    StatusCodes.Status401Unauthorized,
                    "Unauthorized",
                    unauthorizedEx.Message,
                    null),

                _ => (
                    StatusCodes.Status500InternalServerError,
                    "Internal Server Error",
                    env.IsDevelopment() 
                        ? $"{exception.GetType().FullName}: {exception.Message} {(exception.InnerException != null ? "--> " + exception.InnerException.Message : "")} \n {exception.StackTrace}"
                        : "An unexpected error occurred while processing your request. Please try again later.",
                    null)
            };

            httpContext.Response.StatusCode = statusCode;

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = httpContext.Request.Path
            };

            if (errors is not null)
            {
                problemDetails.Extensions["errors"] = errors;
            }

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
