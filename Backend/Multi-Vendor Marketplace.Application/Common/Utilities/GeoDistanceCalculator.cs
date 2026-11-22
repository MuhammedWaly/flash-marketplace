using System;

namespace Multi_Vendor_Marketplace.Application.Common.Utilities
{
    public static class GeoDistanceCalculator
    {
        private const double EarthRadiusKm = 6371.0;
        private const decimal BaseDeliveryFee = 15.00m;
        private const decimal PerKmFee = 2.50m;

        /// <summary>
        /// Calculates the spherical distance between two coordinates in kilometers using the Haversine formula.
        /// </summary>
        public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distance = EarthRadiusKm * c;

            return Math.Round(distance, 2);
        }

        /// <summary>
        /// Calculates dynamic delivery fee based on distance:
        /// Flat base fee of 15 EGP for the first 2 km, plus 2.5 EGP per additional km.
        /// </summary>
        public static decimal CalculateDeliveryFee(double distanceKm)
        {
            if (distanceKm <= 2.0)
            {
                return BaseDeliveryFee;
            }

            var extraKm = (decimal)(distanceKm - 2.0);
            var totalFee = BaseDeliveryFee + (extraKm * PerKmFee);
            return Math.Round(totalFee, 2);
        }

        private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
    }
}
