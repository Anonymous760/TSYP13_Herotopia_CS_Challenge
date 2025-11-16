using System.ComponentModel.DataAnnotations;

namespace SignatureAPP.Models
{
    public class NeoFileUpload
    {
        [Key]
        public string FileName { get; set; }
      
        public string fileBase64 { get; set; }
       
    }
}
