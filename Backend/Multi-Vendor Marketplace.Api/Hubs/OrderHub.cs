using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Hubs
{
    [Authorize]
    public class OrderHub : Hub<IOrderClient>
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            await base.OnConnectedAsync();
        }

        public async Task JoinRestaurantGroup(string restaurantId)
        {
            if (Guid.TryParse(restaurantId, out var id))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"restaurant_{id}");
            }
        }

        public async Task LeaveRestaurantGroup(string restaurantId)
        {
            if (Guid.TryParse(restaurantId, out var id))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"restaurant_{id}");
            }
        }

        public async Task JoinCustomerGroup(string customerId)
        {
            if (Guid.TryParse(customerId, out var id))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"customer_{id}");
            }
        }

        public async Task JoinOrderGroup(string orderId)
        {
            if (Guid.TryParse(orderId, out var id))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{id}");
            }
        }
    }
}
