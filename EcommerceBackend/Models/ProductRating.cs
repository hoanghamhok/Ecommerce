using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("ProductRatings")]
    public class ProductRating
    {
        [Key]
        public int ProductId { get; set; }

        public double AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public int Rating1Star { get; set; }
        public int Rating2Star { get; set; }
        public int Rating3Star { get; set; }
        public int Rating4Star { get; set; }
        public int Rating5Star { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Product Product { get; set; }
    }
}