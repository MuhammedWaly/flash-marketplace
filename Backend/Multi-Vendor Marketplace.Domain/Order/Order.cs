using System;
using System.Collections.Generic;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;

namespace Multi_Vendor_Marketplace.Domain.Order
{
    public class Order : AuditableEntity
    {
        public string OrderNumber { get; private set; } = string.Empty;
        public Guid CustomerId { get; private set; }
        public Customer.Customer? Customer { get; private set; }
        public Guid? ResturantId { get; private set; }
        public Resturants.Resturant? Resturant { get; private set; }
        public OrderStatus Status { get; private set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;
        public decimal SubTotal { get; private set; }
        public decimal ShippingFee { get; private set; }
        public decimal TotalAmount { get; private set; }
        public string? ShippingAddress { get; private set; }
        public string? PaymentMethod { get; private set; }

        public ICollection<OrderItem.OrderItem> OrderItems { get; private set; } = [];

        private Order()
        {
        }

        private Order(Guid id, string orderNumber, Guid customerId, Guid? resturantId, decimal subTotal, decimal shippingFee, decimal totalAmount, string? shippingAddress, string? paymentMethod)
            : base(id)
        {
            OrderNumber = orderNumber;
            CustomerId = customerId;
            ResturantId = resturantId;
            SubTotal = subTotal;
            ShippingFee = shippingFee;
            TotalAmount = totalAmount;
            ShippingAddress = shippingAddress;
            PaymentMethod = paymentMethod;
            Status = OrderStatus.Pending;
            PaymentStatus = PaymentStatus.Pending;
        }

        public static Result<Order> Create(Guid id, string orderNumber, Guid customerId, Guid? resturantId, decimal subTotal, decimal shippingFee, string? shippingAddress = null, string? paymentMethod = null)
        {
            if (string.IsNullOrWhiteSpace(orderNumber))
            {
                return OrderError.OrderNumberRequired;
            }

            if (customerId == Guid.Empty)
            {
                return OrderError.CustomerRequired;
            }

            decimal total = subTotal + shippingFee;

            return new Order(id, orderNumber.Trim(), customerId, resturantId, subTotal, shippingFee, total, shippingAddress?.Trim(), paymentMethod?.Trim());
        }

        public static Result<Order> Create(Guid id, string orderNumber, Guid customerId, decimal subTotal, decimal shippingFee, string? shippingAddress = null, string? paymentMethod = null)
        {
            return Create(id, orderNumber, customerId, null, subTotal, shippingFee, shippingAddress, paymentMethod);
        }

        public Result<Updated> UpdateStatus(OrderStatus newStatus)
        {
            if (Status == OrderStatus.Delivered || Status == OrderStatus.Cancelled)
            {
                return OrderError.InvalidStatusTransition;
            }

            Status = newStatus;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public Result<Updated> UpdatePaymentStatus(PaymentStatus paymentStatus)
        {
            PaymentStatus = paymentStatus;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (Status != OrderStatus.Cancelled && Status != OrderStatus.Pending)
            {
                return OrderError.CannotDelete;
            }

            if (IsDeleted)
            {
                return Result.Deleted;
            }

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            return Result.Deleted;
        }
    }
}
