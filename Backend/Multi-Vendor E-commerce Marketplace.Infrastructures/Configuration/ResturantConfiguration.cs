using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Infrastructures.Configuration
{
    public class ResturantConfiguration : IEntityTypeConfiguration<Resturant>
    {
        public void Configure(EntityTypeBuilder<Resturant> builder)
        {
            builder.HasKey(r=>r.Id);

            builder.Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(r => r.Description)
                .IsRequired()
                .HasMaxLength(500);
            builder.Property(r => r.category)
                .IsRequired()
                .HasMaxLength(50);
            builder.Property(r => r.LogoUrl)
                .HasMaxLength(200);
            builder.Property(r => r.CoverImageUrl)
                .HasMaxLength(200);
            builder.Property(r => r.PhoneNumber)
                .HasMaxLength(20);

            builder.HasMany(r => r.Dishes)
                .WithOne(d => d.Resturant)
                .HasForeignKey(d => d.ResturantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.OwnsOne(a => a.Address);
             
                

        }
    }
}
