using MimeKit;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SignatureAPP.Services;
using SignatureAPP.Models;

public class EmailService : IEmailService
{
    private readonly string senderEmail;
    private readonly string FrontUrl;
    private readonly string senderPassword;
    private readonly string smtpServer;
    private readonly int smtpPort;


    public EmailService(IConfiguration configuration)
    {
        senderEmail = configuration["SmtpSettings:SenderEmail"];
        senderPassword = configuration["SmtpSettings:SenderPassword"];
        smtpServer = configuration["SmtpSettings:Server"];
        smtpPort = int.Parse(configuration["SmtpSettings:Port"]);
        FrontUrl = configuration["URLS:FrontUrl"];
    }

    public async Task SendVerificationEmail(string recipientEmail, string fullName, string token)
    {
        try
        {
            var encodedEmail = Uri.EscapeDataString(recipientEmail);
            var encodedToken = Uri.EscapeDataString(token);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("UtopiaHire", senderEmail));
            message.To.Add(new MailboxAddress(fullName, recipientEmail));
            message.Subject = "Verify Your Email Address";

            var htmlBody = $@"
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }}
        h2 {{
            color: #333333;
        }}
        p {{
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
        }}
        .button {{
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            font-size: 16px;
            color: white; 
            background-color: #3B82F6; 
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 14px;
            color: #888888;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class='container'>
       <h2>Hello {fullName},</h2>
       <p>Thank you for signing up on UtopiaHire. To complete your registration, please verify your email address by clicking the button below:</p>
       <a class='button' href='{FrontUrl}/verify-email?email={encodedEmail}&token={encodedToken}'>Verify my email address</a>

        <div class='footer'>
           <p>© 2025 UtopiaHire. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            var body = new TextPart("html") { Text = htmlBody };
            message.Body = body;

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }

            Console.WriteLine("Verification email sent successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while sending email: {ex.Message}");
        }
    }

    public async Task SendSignatureEmail(string nextSigner, string creatorName, string signerName, string transId, string signerEmail)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Neosign", senderEmail));
            message.To.Add(new MailboxAddress(signerName, signerEmail));
            message.Subject = "Demande de signature";

            var htmlBody = $@"
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }}
                h2 {{
                    color: #333333;
                }}
                p {{
                    font-size: 16px;
                    color: #555555;
                    line-height: 1.6;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    margin-top: 20px;
                    font-size: 16px;
                    color: #000000;
                    background-color: #3B82F6;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: bold;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Bonjour {signerName},</h2>
                <p>{creatorName} vous a envoyé une demande de signature électronique.</p>
                <p>Pour faire suite à cette invitation, veuillez cliquer sur le bouton ci-dessous :</p>
                <a class='button' href='{FrontUrl}/sign/Demande/{nextSigner}/trans/{transId}'>Voir l'invitation</a>
               
               <div class='footer'>
                    <p>© 2025 NeoSign. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>";

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }

            Console.WriteLine("Signature email sent successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while sending email: {ex.Message}");
        }
    }

    public async Task sendSignedpdfEmail(string recipientEmail, string fullName, List<NeoDocument> docs)
    {
        try
        {
            string wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "stockage");
            string pdfsFolderPath = Path.Combine(wwwRootPath, "pdfs");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("NeoSign", senderEmail));
            message.To.Add(new MailboxAddress(fullName, recipientEmail));
            message.Subject = "Demande signée ";

            var htmlBody = $@"
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }}
                h2 {{
                    color: #333333;
                }}
                p {{
                    font-size: 16px;
                    color: #555555;
                    line-height: 1.6;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Bonjour {fullName},</h2>
                <p>Votre damande a été signée avec succès.</p>
                <p>Vous trouverez ci-joint le(s) document(s) PDF signé(s).</p>
                <p>Merci d'utiliser NeoSign.</p>
                <div class='footer'>
                    <p>© 2025 NeoSign. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>";

            var builder = new BodyBuilder { HtmlBody = htmlBody };

            var attachmentTasks = docs.Select(async doc =>
            {
                var pdfPath = Path.Combine(pdfsFolderPath, doc.DocId + ".pdf");
                if (File.Exists(pdfPath))
                {
                    var pdfContent = await File.ReadAllBytesAsync(pdfPath).ConfigureAwait(false);
                    return (pdfContent, doc.DocName);
                }
                else
                {
                    Console.WriteLine($"Fichier introuvable : {pdfPath}");
                    return (null, (string)null);
                }
            }).ToList();

            var attachments = await Task.WhenAll(attachmentTasks).ConfigureAwait(false);

            foreach (var (pdfContent, pdfFileName) in attachments)
            {
                if (pdfContent != null && pdfFileName != null)
                {
                    builder.Attachments.Add(pdfFileName, pdfContent, new ContentType("application", "pdf"));
                }
            }

            message.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls).ConfigureAwait(false);
                await client.AuthenticateAsync(senderEmail, senderPassword).ConfigureAwait(false);
                await client.SendAsync(message).ConfigureAwait(false);
                await client.DisconnectAsync(true).ConfigureAwait(false);
            }

            Console.WriteLine("Email de signature envoyé avec succès avec les pièces jointes PDF !");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur lors de l'envoi de l'email : {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }

    public async Task sendOTP(string email, int code)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("NeoSign", senderEmail));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Code de vérification OTP – NeoSign";

            var htmlBody = $@"
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 50px auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                h2 {{
                    color: #333333;
                }}
                p {{
                    font-size: 16px;
                    color: #555555;
                    line-height: 1.5;
                }}
                .otp-code {{
                    display: inline-block;
                    background-color: #e0f0ff;
                    color: #007BFF;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 12px 24px;
                    border-radius: 6px;
                    margin-top: 20px;
                }}
                .footer {{
                    margin-top: 40px;
                    font-size: 14px;
                    color: #999999;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Bonjour,</h2>
               
                <p>Votre Code OTP pour NeoSign :</p>
                <div class='otp-code'>{code}</div>
                <p>Ce code est valable pour une durée limitée.</p>
                <div class='footer'>
                    <p>© 2025 NeoSign. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>";

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };

            message.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }

            Console.WriteLine("Email OTP envoyé avec succès !");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur lors de l'envoi de l'email OTP : {ex.Message}");
        }
    }





}
