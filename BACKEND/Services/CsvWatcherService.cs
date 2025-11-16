using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SignatureAPP.Services;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace SignatureAPP.Services
{
    public class CsvWatcherService : BackgroundService
    {
        private readonly CsvJobService _csvJobService;
        private readonly ILogger<CsvWatcherService> _logger;
        private readonly string _folderPath = Path.Combine(Directory.GetCurrentDirectory(), "stockage", "vv");
        private FileSystemWatcher? _watcher;

        public CsvWatcherService(CsvJobService csvJobService, ILogger<CsvWatcherService> logger)
        {
            _csvJobService = csvJobService;
            _logger = logger;
            if (!Directory.Exists(_folderPath))
            {
                Directory.CreateDirectory(_folderPath);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CsvWatcherService démarré.");

            _logger.LogInformation("Traitement initial des fichiers existants...");
            await ProcessExistingFilesAsync();

            _watcher = new FileSystemWatcher(_folderPath, "*.csv")
            {
                NotifyFilter = NotifyFilters.FileName | NotifyFilters.CreationTime | NotifyFilters.LastWrite
            };

            _watcher.Created += async (s, e) =>
            {
                if (stoppingToken.IsCancellationRequested) return;

                _logger.LogInformation($"Nouveau fichier détecté : {Path.GetFileName(e.FullPath)}");

                await WaitForFileAsync(e.FullPath);

                _logger.LogInformation($"Démarrage du traitement pour : {Path.GetFileName(e.FullPath)}");
                try
                {
                    await ProcessFileAndLogLinesAsync(e.FullPath);
                    _logger.LogInformation($"Traitement terminé pour : {Path.GetFileName(e.FullPath)}");
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, $"Erreur lors du traitement du fichier : {Path.GetFileName(e.FullPath)}");
                }
            };

            _watcher.EnableRaisingEvents = true;

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task ProcessExistingFilesAsync()
        {
            var files = Directory.GetFiles(_folderPath, "*.csv");
            foreach (var file in files)
            {
                await ProcessFileAndLogLinesAsync(file);
            }
        }

        private async Task ProcessFileAndLogLinesAsync(string filePath)
        {
            // Compter les lignes du CSV
            int lineCount = 0;
            using (var reader = new StreamReader(filePath))
            {
                while (await reader.ReadLineAsync() != null)
                {
                    lineCount++;
                }
            }

            _logger.LogInformation($"Fichier {Path.GetFileName(filePath)} contient {lineCount - 1} ligne(s) de données (hors en-tête).");

            // Traiter le fichier avec ton service CsvJobService
            await _csvJobService.ProcessCsvFilesAsync();
        }

        private async Task WaitForFileAsync(string path)
        {
            const int maxRetries = 1000;
            int retries = 0;
            while (retries < maxRetries)
            {
                try
                {
                    using (File.Open(path, FileMode.Open, FileAccess.Read, FileShare.None))
                    {
                        break;
                    }
                }
                catch (IOException)
                {
                    await Task.Delay(500);
                    retries++;
                }
            }
            if (retries == maxRetries)
            {
                _logger.LogWarning($"Le fichier {Path.GetFileName(path)} n'était pas accessible après plusieurs tentatives.");
            }
        }

        public override void Dispose()
        {
            _watcher?.Dispose();
            _logger.LogInformation("CsvWatcherService arrêté.");
            base.Dispose();
        }
    }
}
