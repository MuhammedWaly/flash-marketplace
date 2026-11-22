using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Infrastructures.Configuration
{
    public class DishConfiguration : IEntityTypeConfiguration<Dish>
    {
        public void Configure(EntityTypeBuilder<Dish> builder)
        {
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(d => d.description)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(d => d.Price)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.HasOne(d => d.Resturant)
                .WithMany(r => r.Dishes)
                .HasForeignKey(d => d.ResturantId);

            
                
        }
    }
}
