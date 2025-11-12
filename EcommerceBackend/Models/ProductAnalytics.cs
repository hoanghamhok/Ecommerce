using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models;
namespace Models
{
    public class ProductAnalytics
    {
        public int Id { get; set; }
        public int ProductId { get; set; }

        public int Views { get; set; }
        public int AddToCartCount { get; set; }
        public int PurchaseCount { get; set; }

        public virtual Product Product { get; set; } = null!;
    }
}