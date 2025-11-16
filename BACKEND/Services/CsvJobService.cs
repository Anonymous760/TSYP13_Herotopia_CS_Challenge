using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Data.SqlClient;
using SignatureAPP.Models;
using System.Data;
using System.Globalization;

namespace SignatureAPP.Services
{
    public class CsvJobService
    {
        private readonly string _connectionString;
        private readonly ILogger<CsvJobService> _logger;

        public CsvJobService(IConfiguration configuration, ILogger<CsvJobService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        public async Task ProcessCsvFilesAsync(int batchSize = 2600)
        {
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "stockage", "vv");
            var files = Directory.GetFiles(folderPath, "*.csv");

            foreach (var file in files)
            {
                _logger.LogInformation("Traitement du fichier : {FileName}", Path.GetFileName(file));
                await ProcessCsvFileInBatchesAsync(file, batchSize);
            }
        }

        private async Task ProcessCsvFileInBatchesAsync(string filePath, int batchSize)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                MissingFieldFound = null,
                HeaderValidated = null
            };

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, config);
            csv.Context.RegisterClassMap<JobMap>();

            var records = csv.GetRecords<Job>()
                             .Where(j => j.JobId != 0) // skip JobId null/0
                             .ToList();

            int totalRows = records.Count;
            int processedRows = 0;

            _logger.LogInformation("Nombre de lignes valides : {Count}", totalRows);

            while (processedRows < totalRows)
            {
                var batch = records.Skip(processedRows).Take(batchSize).ToList();
                try
                {
                    await InsertBatchAsync(batch);
                    processedRows += batch.Count;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de l'insertion d'un batch dans la base de données.");
                    processedRows += batch.Count; // skip ce batch pour continuer
                }
            }
        }

        private async Task InsertBatchAsync(List<Job> jobsBatch)
        {
            if (jobsBatch.Count == 0) return;

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var bulkCopy = new SqlBulkCopy(connection)
            {
                DestinationTableName = "Jobs",
                BatchSize = jobsBatch.Count
            };

            var table = new DataTable();
            table.Columns.Add("JobId", typeof(long));
            table.Columns.Add("Title", typeof(string));
            table.Columns.Add("Company", typeof(string));
            table.Columns.Add("Location", typeof(string));
            table.Columns.Add("DatePosted", typeof(DateTime));
            table.Columns.Add("JobUrl", typeof(string));
            table.Columns.Add("Description", typeof(string));
            table.Columns.Add("JobFunction", typeof(string));
            table.Columns.Add("MatchContext", typeof(string));
            table.Columns.Add("HardSkills", typeof(string));
            table.Columns.Add("DomainKeywords", typeof(string));
            table.Columns.Add("JobTitle", typeof(string));
            table.Columns.Add("RequiredMinYears", typeof(int));
            table.Columns.Add("Embedding", typeof(string));

            foreach (var job in jobsBatch)
            {
                if (job.JobId == 0) continue; // skip invalid JobId

                table.Rows.Add(
                    job.JobId,
                    job.Title ?? string.Empty,
                    job.Company ?? string.Empty,
                    job.Location ?? string.Empty,
                    job.DatePosted ?? (object)DBNull.Value,
                    job.JobUrl ?? string.Empty,
                    job.Description ?? string.Empty,
                    job.JobFunction ?? string.Empty,
                    job.MatchContext ?? string.Empty,
                    job.HardSkills ?? string.Empty,
                    job.DomainKeywords ?? string.Empty,
                    job.JobTitle ?? string.Empty,
                    job.RequiredMinYears ?? (object)DBNull.Value,
                    job.Embedding ?? string.Empty
                );
            }

            if (table.Rows.Count > 0)
            {
                await bulkCopy.WriteToServerAsync(table);
                _logger.LogInformation("{Count} lignes insérées dans Jobs.", table.Rows.Count);
            }
            else
            {
                _logger.LogInformation("Aucune ligne valide à insérer pour ce batch.");
            }
        }
    }
}
