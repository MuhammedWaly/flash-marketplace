using System;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using ResultClass = Multi_Vendor_Marketplace.Domain.Common.Result.Result;

namespace Multi_Vendor_Marketplace.Domain.Common
{
    public abstract class AuditableEntity : Entity
    {
        public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; protected set; }
        public bool IsDeleted { get; protected set; }
        public DateTime? DeletedAt { get; protected set; }

        protected AuditableEntity()
        {
        }

        protected AuditableEntity(Guid id) : base(id)
        {
        }

        public virtual Result<Deleted> Delete()
        {
            if (IsDeleted)
            {
                return ResultClass.Deleted;
            }

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            return ResultClass.Deleted;
        }
    }
}
