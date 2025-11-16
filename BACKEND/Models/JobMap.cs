using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using System.Globalization;

namespace SignatureAPP.Models
{
    public class JobMap : ClassMap<Job>
    {
        public JobMap()
        {
            // IMPORTANT : NE PAS MAPPER 'Id'. Il est auto-généré.

            // Mappages des colonnes CSV vers les propriétés du modèle
            Map(j => j.JobId).Name("job_id");
            Map(j => j.Title).Name("title");
            Map(j => j.Company).Name("company");
            Map(j => j.Location).Name("location");
            Map(j => j.DatePosted).Name("date_posted");
            Map(j => j.JobUrl).Name("job_url");
            Map(j => j.Description).Name("description");
            Map(j => j.JobFunction).Name("job_function");
            Map(j => j.MatchContext).Name("match_context");
            Map(j => j.HardSkills).Name("hard_skills");
            Map(j => j.DomainKeywords).Name("domain_keywords");
            Map(j => j.JobTitle).Name("job_title");
            Map(j => j.Embedding).Name("embedding");

            // Convertisseur personnalisé pour RequiredMinYears
            Map(j => j.RequiredMinYears)
                .Name("required_min_years")
                .TypeConverterOption.NullValues(string.Empty)
                .TypeConverter<IntFromStringConverter>();
        }
    }

    public class IntFromStringConverter : DefaultTypeConverter
    {
        public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out double d))
                return (int)d;

            return null;
        }
    }
}