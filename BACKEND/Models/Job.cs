using System.ComponentModel.DataAnnotations;

public class Job
{
    [Key]
    public int Id { get; set; }  // Identity auto-incrémentée
    public long JobId { get; set; }
    public string? Title { get; set; }
    public string? Company { get; set; }
    public string? Location { get; set; }
    public DateTime? DatePosted { get; set; }
    public string? JobUrl { get; set; }
    public string? Description { get; set; }
    public string? JobFunction { get; set; }
    public string? MatchContext { get; set; }
    public string? HardSkills { get; set; }
    public string? DomainKeywords { get; set; }
    public string? JobTitle { get; set; }
    public int? RequiredMinYears { get; set; }
    public string? Embedding { get; set; }
}
