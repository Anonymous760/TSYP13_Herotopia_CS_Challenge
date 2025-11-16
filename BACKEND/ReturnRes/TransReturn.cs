using iText.Kernel.Pdf.Tagging;
using Org.BouncyCastle.Crypto.Digests;
using SignatureAPP.Models;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


  
    namespace SignatureAPP.ReturnRes
    {
        public class TransReturn
        {
            [Key]
            public string TransId { get; set; }

            public string puuid { get; set; }
            public DateTime dateTime { get; set; } 
            public string status { get; set; }
            public DateTime? signingTime { get; set; }

            public List<SignerInfo>? SignersInfo { get; set; } = new List<SignerInfo>();
            public List<PdfInfo>? Pdfs { get; set; } = new List<PdfInfo>();

        
        }

        public class SignerInfo
        {
            
            public string Prenom { get; set; } 
            public string SignerID { get; set; }
            public string Nom { get; set; }
            public string Email { get; set; }
            public string Telephone { get; set; }
            public string Statut { get; set; }  
            public DateTime? SigningTime { get; set; }
            public string RefusalReason { get; set; }
            public string TypeSignature { get; set; }
        }

        public class PdfInfo
        {
            public string PDFId { get; set; }
            public float Taille { get; set; }
            public string Name { get; set; }
            public string Base64Data { get; set; }  
        }
    }


