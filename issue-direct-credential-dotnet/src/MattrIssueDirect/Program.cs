using Ardalis.GuardClauses;
using HandlebarsDotNet;
using Mattr;
using MattrIssueDirect.Models;
using MattrIssueDirect.Services;
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

// Add Swagger Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services
    .AddControllers()
    // Adding Newtonsoft
    .AddNewtonsoftJson();

builder.Services.AddHttpLogging(options =>
{
    // Add http logging for all fields for debugging & flow
    options.LoggingFields = HttpLoggingFields.All;
});

// Add ILogger
builder.Services.AddLogging();

// Register services with Dependency injection
builder.Services
    .AddSingleton<IShortenUrlService, ShortenUrlService>()
    .AddSingleton<IPresentationService, PresentationService>()
    .AddScoped<ICredentialService, CredentialService>()
    .AddScoped<IMessageService, MessageService>();

var config = builder.Configuration.GetRequiredSection("Mattr");

// Configure the Mattr library
builder.Services.AddSingleton<MattrClientConfig>(new MattrClientConfig
{
    Tenant = Guard.Against.Null(config.GetValue<string>("Tenant")),
    AuthTenant = Guard.Against.Null(config.GetValue<string>("AuthTenant")),
    ClientId = Guard.Against.Null(config.GetValue<string>("ClientId")),
    ClientSecret = Guard.Against.Null(config.GetValue<string>("ClientSecret")),
    Audience = Guard.Against.Null(config.GetValue<string>("Audience")),
});

builder.Services.AddScoped<IMattrClient, MattrClient>()
    // Inject our HttpClient this handles clean up of the client to prevent socket exhaustion and memory leaks.
    .AddHttpClient<IMattrClient, MattrClient>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpLogging();
app.UseHttpsRedirection();
app.MapControllers();
app.MapSwagger();

var defaults = new ViewDefaults(Guard.Against.Null(config.GetValue<string>("IssuerDid")));

app.MapGet("/", () =>
{
    var source = File.ReadAllText("index.html");
    var template = Handlebars.Compile(source);
    return Results.Content(template(defaults), "text/html");
});

app.Run();
