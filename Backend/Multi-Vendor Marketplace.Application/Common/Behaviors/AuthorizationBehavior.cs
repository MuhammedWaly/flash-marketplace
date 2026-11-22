using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Exceptions;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Security;
using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Behaviors
{
    public class AuthorizationBehavior<TRequest, TResponse>(
        ICurrentUserService currentUserService,
        IPermissionService permissionService)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var authorizeAttributes = request.GetType()
                .GetCustomAttributes<AuthorizeAttribute>()
                .ToList();

            if (authorizeAttributes.Count == 0)
            {
                return await next();
            }

            if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            if (currentUserService.IsAdmin)
            {
                return await next();
            }

            var permissionsRequired = authorizeAttributes
                .Where(a => !string.IsNullOrWhiteSpace(a.Permissions))
                .SelectMany(a => a.Permissions.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
                .ToList();

            if (permissionsRequired.Count != 0)
            {
                var userPermissions = await permissionService.GetPermissionsForUserAsync(currentUserService.UserId);

                var hasAllPermissions = permissionsRequired.All(p => userPermissions.Contains(p));
                if (!hasAllPermissions)
                {
                    throw new ForbiddenAccessException("You do not have the required permissions to execute this request.");
                }
            }

            return await next();
        }
    }
}
