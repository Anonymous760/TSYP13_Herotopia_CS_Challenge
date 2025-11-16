using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SignatureAPP.Models
{
    public class NeoDocument
    {
        [Key]
        public string DocId { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string DocName {  get; set; }
       


    }
}
