using iText.Commons.Actions.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Cms;
using SignatureAPP.Data;
using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.ReturnRes;
using SignatureAPP.ReturnRes;
using System.IO.Compression;


namespace SignatureAPP.Services
{
    public class TransactionService : ITransactionService
    {
        protected readonly DbContextClass _dbContextClass;
        protected UserManager<AppUser> _userManager;
        protected readonly IEmailService _emailService;
       
        protected readonly ILogger<TransactionService> _logger;
        
        public TransactionService(DbContextClass dbContextClass, UserManager<AppUser> userManager, IEmailService emailService, ILogger<TransactionService> logger)
        {
            _dbContextClass = dbContextClass;
            _userManager = userManager;
            _emailService = emailService;
           
            _logger = logger;
           
        }
        public async Task<(List<NeoDocument> documents, List<ReturnDocs> returns)> AddDocumentAsync(List<NeoFileUpload> models, string userId)
        {
            try
            {
                var returns = new List<ReturnDocs>();
                var documents = new List<NeoDocument>();

                string wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "stockage", "pdfs");
                if (!Directory.Exists(wwwRootPath))
                {
                    Directory.CreateDirectory(wwwRootPath);
                }

                foreach (var model in models)
                {
                   
                    byte[] pdfBytes = Convert.FromBase64String(model.fileBase64);

                    
                    string name = Guid.NewGuid().ToString("N");
                    string fileName = $"{name}.pdf";
                    string filePath = Path.Combine(wwwRootPath, fileName);

                    
                    await System.IO.File.WriteAllBytesAsync(filePath, pdfBytes);

                   
                    returns.Add(new ReturnDocs
                    {
                        docId = name,
                        docBase64 = model.fileBase64
                    });

                    _logger.LogInformation($"[TransactionService/AddDocument01] Document ajouté au retour avec ID : {name}");

                    // Créer l’objet NeoDocument
                    var document = new NeoDocument
                    {
                        DocName = model.FileName,
                        UserId = userId,
                        DocId = name
                    };

                    documents.Add(document);
                }

              
                await _dbContextClass.AddRangeAsync(documents);
                await _dbContextClass.SaveChangesAsync();

                _logger.LogInformation("[TransactionService/AddDocument02] Tous les documents ont été ajoutés avec succès.");

                return (documents, returns);
            }
            catch (Exception ex)
            {
                _logger.LogError($"[TransactionService/AddDocument03] Erreur inattendue : {ex.Message}");
                return (null, null);
            }
        }
        public async Task<PdfInfo> GetPdfInfo( NeoDocument doc)
        {

            try
            {
               
                var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "stockage", "pdfs");

               
                    var filePath = Path.Combine(webRootPath, $"{doc.DocId}.pdf");

                    if (System.IO.File.Exists(filePath))
                    {
                        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                        var pdfInfo = new PdfInfo
                        {
                            PDFId = doc.DocId,
                            Name = doc.DocName,
                            Base64Data = Convert.ToBase64String(fileBytes)
                        };
                        _logger.LogInformation($" [TransactionService/GetPdfInfo01] retrieved pdfinfo    ");
                          return pdfInfo;

                     }
                else
                {
                    return null;
                }
                
               
            }
            catch (Exception ex)
            {
                _logger.LogError($" [TransactionService/GetPdfInfo01]  Unexpected  Error  : {ex.Message}");
                return null;
            }
        }








    }
}
