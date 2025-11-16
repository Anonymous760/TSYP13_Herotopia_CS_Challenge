using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.ReturnRes;


namespace SignatureAPP.Services
{
    public interface ITransactionService
    {
        
        public  Task<(List<NeoDocument> documents, List<ReturnDocs> returns)> AddDocumentAsync(List<NeoFileUpload> models, string userId);
        public  Task<PdfInfo> GetPdfInfo(NeoDocument doc);


     }   
}
