using Mscc.GenerativeAI;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace NaviMonitor.Api.Services;

public class MaintenanceAIService
{
    private readonly string _apiKey;
    private readonly ILogger<MaintenanceAIService> _logger;

    public MaintenanceAIService(IConfiguration config, ILogger<MaintenanceAIService> logger)
    {
        _apiKey = config["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API Key is missing! Check your user-secrets.");
        _logger = logger;
    }

    public async Task<string> ProcessManualImages(List<byte[]> imagesBytes)
    {
        try
        {
            var googleAi = new GoogleAI(_apiKey);
            var model = googleAi.GenerativeModel(model: "gemini-flash-latest");

            string prompt = @"
                Act as an expert mechanic. Analyze these pages from a maintenance schedule manual.
                Combine the data from ALL provided images and extract a unified list of maintenance tasks.

                Instructions:
                1. Differentiate between 'Initial' (break-in/first-time) service and 'Regular' (recurring) intervals.
                2. Use 'km' for all distance values. Ignore miles or months.
                3. The 'interval' field must represent the recurring pattern (e.g., every 4,000km).
                4. The 'initial' field is for the first-ever check (e.g., the 1,000km break-in). If no specific initial check exists, omit the field or set to null.
                5. Extract items for: 'R' (Replace), 'C' (Clean), and 'I' (Inspect).
                6. Handle vehicle variants as separate line items.

                Return ONLY a raw JSON object with this exact structure:
                {
                  ""matrix"": [
                    { 
                      ""item"": ""string"", 
                      ""initial"": number or null, 
                      ""interval"": number, 
                      ""action"": ""string (Replace, Clean, or Inspect)"" 
                    }
                  ]
                }";

            var promptParts = new List<Mscc.GenerativeAI.Types.IPart>
            {
                new Mscc.GenerativeAI.Types.Part { Text = prompt }
            };

            foreach (var imgBytes in imagesBytes)
            {
                promptParts.Add(new Mscc.GenerativeAI.Types.Part
                {
                    InlineData = new Mscc.GenerativeAI.Types.InlineData
                    {
                        MimeType = "image/jpeg",
                        Data = Convert.ToBase64String(imgBytes)
                    }
                });
            }

            var request = new Mscc.GenerativeAI.Types.GenerateContentRequest
            {
                Contents = new List<Mscc.GenerativeAI.Types.Content>
                {
                    new Mscc.GenerativeAI.Types.Content
                    {
                        Role = "user",
                        Parts = promptParts
                    }
                }
            };

            var response = await model.GenerateContent(request);

            var rawJson = response.Text?.Replace("```json", "").Replace("```", "").Trim() ?? "{}";

            return rawJson;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini AI failed. Check your API Key and internet connection.");
            return "{\"error\": \"AI processing failed\"}";
        }
    }
}
