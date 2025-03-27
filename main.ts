import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Aspire Docs",
  version: "1.0.0"
});

// Define integration data
const integrationData = {
  overview: `# .NET Aspire Integrations Overview

.NET Aspire integrations are a curated suite of NuGet packages selected to facilitate the integration of cloud-native applications with prominent services and platforms, such as Redis and PostgreSQL. Each integration furnishes essential cloud-native functionalities through either automatic provisioning or standardized configuration patterns.`,

  hostingIntegrations: `## Hosting Integrations

Hosting integrations configure applications by provisioning resources (like containers or cloud resources) or pointing to existing instances. These packages model various services, platforms, or capabilities, including caches, databases, logging, storage, and messaging systems.

Hosting integrations extend the IDistributedApplicationBuilder interface, enabling the _app host_ project to express resources within its _app model_. The official hosting integration NuGet packages are tagged with \`aspire\`, \`integration\`, and \`hosting\`.`,

  clientIntegrations: `## Client Integrations

Client integrations wire up client libraries to dependency injection (DI), define configuration schema, and add health checks, resiliency, and telemetry where applicable. .NET Aspire client integration libraries are prefixed with \`Aspire.\` and then include the full package name that they integrate with, such as \`Aspire.StackExchange.Redis\`.

These packages configure existing client libraries to connect to hosting integrations. They extend the IHostApplicationBuilder interface allowing client-consuming projects, such as your web app or API, to use the connected resource.`,

  features: `## Integration Features

When you add a client integration to a project within your .NET Aspire solution, service defaults are automatically applied to that project. The following service defaults are applied:

* **Observability and telemetry**: Automatically sets up logging, tracing, and metrics configurations
* **Health checks**: Exposes HTTP endpoints to provide basic availability and state information about an app
* **Resiliency**: The ability of your system to react to failure and still remain functional`,

  cloudAgnostic: `## Cloud-Agnostic Integrations

.NET Aspire provides many cloud-agnostic integrations including:

| Integration | Description |
|-------------|-------------|
| Apache Kafka | A library for producing and consuming messages from an Apache Kafka broker |
| Dapr | A library for modeling Dapr as a .NET Aspire resource |
| Elasticsearch | A library for accessing Elasticsearch databases |
| MongoDB | A library for accessing MongoDB databases |
| PostgreSQL | A library for accessing PostgreSQL databases |
| Redis | A library for accessing Redis caches |
| SQL Server | A library for accessing Microsoft SQL Server databases |`,

  azure: `## Azure Integrations

.NET Aspire provides integrations with various Azure services:

| Integration | Description |
|-------------|-------------|
| Azure Cosmos DB | A library for accessing Azure Cosmos DB databases |
| Azure Service Bus | A library for accessing Azure Service Bus messaging |
| Azure Blob Storage | A library for accessing Azure Blob Storage |
| Azure Key Vault | A library for accessing Azure Key Vault secrets |
| Azure SignalR | A library for accessing Azure SignalR Service |`,

  aws: `## AWS Integrations

.NET Aspire provides the Aspire.Hosting.AWS library for modeling AWS resources.`,

  community: `## Community Toolkit Integrations

The .NET Aspire Community Toolkit includes additional integrations maintained by the community:

| Integration | Description |
|-------------|-------------|
| Azure Static Web Apps emulator | A hosting integration for the Azure Static Web Apps emulator |
| Bun hosting | A hosting integration for Bun apps |
| Deno hosting | A hosting integration for Deno apps |
| Go hosting | A hosting integration for Go apps |
| Java/Spring hosting | An integration for running Java code in .NET Aspire |
| Ollama | An Aspire component leveraging the Ollama container |`
};

// Define service discovery data
const serviceDiscoveryData = {
  overview: `# .NET Aspire Service Discovery

.NET Aspire includes functionality for configuring service discovery at development and testing time. Service discovery functionality works by providing configuration in the format expected by the _configuration-based endpoint resolver_ from the .NET Aspire AppHost project to the individual service projects added to the application model.`,

  implicitDiscovery: `## Implicit Service Discovery by Reference

Configuration for service discovery is only added for services that are referenced by a given project. For example, consider the following AppHost program:

\`\`\`csharp
var builder = DistributedApplication.CreateBuilder(args);

var catalog = builder.AddProject<Projects.CatalogService>("catalog");
var basket = builder.AddProject<Projects.BasketService>("basket");

var frontend = builder.AddProject<Projects.MyFrontend>("frontend")
                      .WithReference(basket)
                      .WithReference(catalog);
\`\`\`

In the preceding example, the _frontend_ project references the _catalog_ project and the _basket_ project. The two WithReference calls instruct the .NET Aspire project to pass service discovery information for the referenced projects (_catalog_, and _basket_) into the _frontend_ project.`,

  namedEndpoints: `## Named Endpoints

Some services expose multiple, named endpoints. Named endpoints can be resolved by specifying the endpoint name in the host portion of the HTTP request URI, following the format \`scheme://_endpointName.serviceName\`.

For example, if a service named "basket" exposes an endpoint named "dashboard", then the URI \`https+http://_dashboard.basket\` can be used to specify this endpoint:

\`\`\`csharp
builder.Services.AddHttpClient<BasketServiceClient>(
    static client => client.BaseAddress = new("https+http://basket"));

builder.Services.AddHttpClient<BasketServiceDashboardClient>(
    static client => client.BaseAddress = new("https+http://_dashboard.basket"));
\`\`\`

In the preceding example, two HttpClient classes are added, one for the core basket service and one for the basket service's dashboard.`,

  namedEndpointsConfig: `### Named Endpoints Using Configuration

With the configuration-based endpoint resolver, named endpoints can be specified in configuration by prefixing the endpoint value with \`_endpointName.\`, where \`endpointName\` is the endpoint name. For example, consider this _appsettings.json_ configuration which defined a default endpoint (with no name) and an endpoint named "dashboard":

\`\`\`json
{
  "Services": {
    "basket":
      "https": "https://10.2.3.4:8080", /* the https endpoint, requested via https://basket */
      "dashboard": "https://10.2.3.4:9999" /* the "dashboard" endpoint, requested via https://_dashboard.basket */
    }
  }
}
\`\`\`

In the preceding JSON:

* The default endpoint, when resolving \`https://basket\` is \`10.2.3.4:8080\`.
* The "dashboard" endpoint, resolved via \`https://_dashboard.basket\` is \`10.2.3.4:9999\`.`,

  namedEndpointsAspire: `### Named Endpoints in .NET Aspire

\`\`\`csharp
var basket = builder.AddProject<Projects.BasketService>("basket")
    .WithHttpsEndpoint(hostPort: 9999, name: "dashboard");
\`\`\``,

  kubernetes: `### Named Endpoints in Kubernetes Using DNS SRV

When deploying to Kubernetes, the DNS SRV service endpoint resolver can be used to resolve named endpoints. For example, the following resource definition will result in a DNS SRV record being created for an endpoint named "default" and an endpoint named "dashboard", both on the service named "basket".

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: basket
spec:
  selector:
    name: basket-service
  clusterIP: None
  ports:
  - name: default
    port: 8080
  - name: dashboard
    port: 9999
\`\`\`

To configure a service to resolve the "dashboard" endpoint on the "basket" service, add the DNS SRV service endpoint resolver to the host builder as follows:

\`\`\`csharp
builder.Services.AddServiceDiscoveryCore();
builder.Services.AddDnsSrvServiceEndpointProvider();
\`\`\`

The special port name "default" is used to specify the default endpoint, resolved using the URI \`https://basket\`.`
};

// Define storage integrations data
const storageData = {
  overview: `# .NET Aspire Storage Integrations

.NET Aspire provides integrations with various storage services, making it easy to add blob storage, queue storage, and table storage to your applications.`,

  azureBlob: `## Azure Blob Storage

Azure Blob Storage is Microsoft's object storage solution for the cloud. Blob Storage is optimized for storing massive amounts of unstructured data such as text or binary data.

The .NET Aspire Azure Blob Storage integration provides:
- Automatic configuration of the Azure Blob Storage client
- Health checks for Azure Blob Storage
- Logging and telemetry for Azure Blob Storage operations

Usage example:
\`\`\`csharp
// In the AppHost project
var storage = builder.AddAzureStorage("storage");
var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(storage);

// In the service project
builder.AddAzureBlobClient("storage");

// Then in your code
public class MyService(BlobServiceClient blobServiceClient)
{
    // Use the client
}
\`\`\``,

  azureQueues: `## Azure Storage Queues

Azure Storage Queues is a service for storing large numbers of messages that can be accessed from anywhere in the world via authenticated calls using HTTP or HTTPS.

The .NET Aspire Azure Storage Queues integration provides:
- Automatic configuration of the Queue Storage client
- Health checks for Queue Storage
- Logging and telemetry for Queue operations

Usage example:
\`\`\`csharp
// In the AppHost project
var storage = builder.AddAzureStorage("storage");
var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(storage);

// In the service project
builder.AddAzureQueueServiceClient("storage");

// Then in your code
public class MyService(QueueServiceClient queueServiceClient)
{
    // Use the client
}
\`\`\``,

  azureTables: `## Azure Table Storage

Azure Table Storage is a service that stores structured NoSQL data in the cloud, providing a key/attribute store with a schemaless design.

The .NET Aspire Azure Table Storage integration provides:
- Automatic configuration of the Table Storage client
- Health checks for Table Storage
- Logging and telemetry for Table operations

Usage example:
\`\`\`csharp
// In the AppHost project
var storage = builder.AddAzureStorage("storage");
var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(storage);

// In the service project
builder.AddAzureTableClient("storage");

// Then in your code
public class MyService(TableServiceClient tableServiceClient)
{
    // Use the client
}
\`\`\``,

  persistVolume: `## Persist Volume Mount

.NET Aspire supports persisting data using volume mounts for containers, ensuring data survives container restarts.

Usage example:
\`\`\`csharp
// In the AppHost project
builder.AddProject<Projects.MyService>("myService")
    .WithVolume("my-data", "/app/data", volume => volume.SetManifestPublishProperties(manifestVolumeType: ManifestVolumeType.EmptyDir));
\`\`\``
};

// Define database integrations data
const databaseData = {
  overview: `# .NET Aspire Database Integrations

.NET Aspire provides integrations with various database systems, making it easy to add database connectivity to your applications with proper configuration, health checks, and telemetry.`,

  sqlServer: `## SQL Server

.NET Aspire provides integration with Microsoft SQL Server, enabling you to easily connect your applications to SQL Server databases.

The .NET Aspire SQL Server integration provides:
- Automatic configuration of SQL Server connection strings
- Health checks for SQL Server connectivity
- Proper configuration of client libraries with best practices
- Logging and telemetry for database operations

Usage example:
\`\`\`csharp
// In the AppHost project
var sql = builder.AddSqlServer("sql")
    .AddDatabase("mydb");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(sql);

// In the service project
builder.AddSqlServerClient("sql");

// Then in your code
public class MyService(SqlConnection sqlConnection)
{
    // Use the connection
}
\`\`\``,

  postgres: `## PostgreSQL

.NET Aspire provides integration with PostgreSQL, enabling you to easily connect your applications to PostgreSQL databases.

The .NET Aspire PostgreSQL integration provides:
- Automatic configuration of PostgreSQL connection strings
- Health checks for PostgreSQL connectivity
- Proper configuration of client libraries with best practices
- Logging and telemetry for database operations

Usage example:
\`\`\`csharp
// In the AppHost project
var postgres = builder.AddPostgres("postgres")
    .AddDatabase("mydb");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(postgres);

// In the service project
builder.AddNpgsqlDataSource("postgres");

// Then in your code
public class MyService(NpgsqlDataSource dataSource)
{
    // Use the data source
}
\`\`\``,

  cosmos: `## Azure Cosmos DB

.NET Aspire provides integration with Azure Cosmos DB, enabling you to easily connect your applications to Cosmos DB accounts.

The .NET Aspire Cosmos DB integration provides:
- Automatic configuration of Cosmos DB connection
- Health checks for Cosmos DB connectivity
- Proper configuration of client libraries with best practices
- Logging and telemetry for database operations

Usage example:
\`\`\`csharp
// In the AppHost project
var cosmos = builder.AddAzureCosmosDB("cosmos");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(cosmos);

// In the service project
builder.AddAzureCosmosDBClient("cosmos");

// Then in your code
public class MyService(CosmosClient cosmosClient)
{
    // Use the client
}
\`\`\``,

  mongodb: `## MongoDB

.NET Aspire provides integration with MongoDB, enabling you to easily connect your applications to MongoDB databases.

The .NET Aspire MongoDB integration provides:
- Automatic configuration of MongoDB connection
- Health checks for MongoDB connectivity
- Proper configuration of client libraries with best practices
- Logging and telemetry for database operations

Usage example:
\`\`\`csharp
// In the AppHost project
var mongodb = builder.AddMongoDB("mongodb");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(mongodb);

// In the service project
builder.AddMongoDBClient("mongodb");

// Then in your code
public class MyService(IMongoClient mongoClient)
{
    // Use the client
}
\`\`\``,

  mysql: `## MySQL

.NET Aspire provides integration with MySQL, enabling you to easily connect your applications to MySQL databases.

The .NET Aspire MySQL integration provides:
- Automatic configuration of MySQL connection strings
- Health checks for MySQL connectivity
- Proper configuration of client libraries with best practices
- Logging and telemetry for database operations

Usage example:
\`\`\`csharp
// In the AppHost project
var mysql = builder.AddMySql("mysql")
    .AddDatabase("mydb");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(mysql);

// In the service project
builder.AddMySqlDataSource("mysql");

// Then in your code
public class MyService(MySqlDataSource dataSource)
{
    // Use the data source
}
\`\`\``
};

// Define messaging integrations data
const messagingData = {
  overview: `# .NET Aspire Messaging Integrations

.NET Aspire provides integrations with various messaging services, making it easy to add messaging capabilities to your cloud-native applications.`,

  azureServiceBus: `## Azure Service Bus

Azure Service Bus is a fully managed enterprise message broker with message queues and publish-subscribe topics.

The .NET Aspire Azure Service Bus integration provides:
- Automatic configuration of Azure Service Bus client
- Health checks for Service Bus connectivity
- Logging and telemetry for messaging operations

Usage example:
\`\`\`csharp
// In the AppHost project
var serviceBus = builder.AddAzureServiceBus("servicebus");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(serviceBus);

// In the service project
builder.AddAzureServiceBusClient("servicebus");

// Then in your code
public class MyService(ServiceBusClient serviceBusClient)
{
    // Use the client
}
\`\`\``,

  rabbitmq: `## RabbitMQ

RabbitMQ is a popular open-source message broker that implements various messaging protocols.

The .NET Aspire RabbitMQ integration provides:
- Automatic configuration of RabbitMQ connection
- Health checks for RabbitMQ connectivity
- Logging and telemetry for RabbitMQ operations

Usage example:
\`\`\`csharp
// In the AppHost project
var rabbitmq = builder.AddRabbitMQ("rabbitmq");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(rabbitmq);

// In the service project
builder.AddRabbitMQClient("rabbitmq");

// Then in your code
public class MyService(IConnection rabbitConnection)
{
    // Use the connection
}
\`\`\``,

  kafka: `## Apache Kafka

Apache Kafka is a distributed event streaming platform used for high-performance data pipelines, streaming analytics, and data integration.

The .NET Aspire Apache Kafka integration provides:
- Automatic configuration of Kafka clients
- Health checks for Kafka connectivity
- Logging and telemetry for Kafka operations

Usage example:
\`\`\`csharp
// In the AppHost project
var kafka = builder.AddKafka("kafka");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(kafka);

// In the service project
builder.AddKafkaClient("kafka");

// Then in your code
public class MyService(IProducer<string, string> producer, IConsumer<string, string> consumer)
{
    // Use the producer and consumer
}
\`\`\``,

  nats: `## NATS

NATS is a simple, secure and high-performance open source messaging system for cloud native applications.

The .NET Aspire NATS integration provides:
- Automatic configuration of NATS connection
- Health checks for NATS connectivity
- Logging and telemetry for NATS operations

Usage example:
\`\`\`csharp
// In the AppHost project
var nats = builder.AddNats("nats");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(nats);

// In the service project
builder.AddNatsClient("nats");

// Then in your code
public class MyService(NATS.Client.IConnection natsConnection)
{
    // Use the connection
}
\`\`\``,

  azureEventHubs: `## Azure Event Hubs

Azure Event Hubs is a big data streaming platform and event ingestion service that can process millions of events per second.

The .NET Aspire Azure Event Hubs integration provides:
- Automatic configuration of Event Hubs client
- Health checks for Event Hubs connectivity
- Logging and telemetry for Event Hubs operations

Usage example:
\`\`\`csharp
// In the AppHost project
var eventHubs = builder.AddAzureEventHubs("eventhubs");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(eventHubs);

// In the service project
builder.AddAzureEventHubsClient("eventhubs");

// Then in your code
public class MyService(EventHubProducerClient producerClient)
{
    // Use the client
}
\`\`\``
};

// Define caching integrations data
const cachingData = {
  overview: `# .NET Aspire Caching Integrations

.NET Aspire provides integrations with caching solutions to improve application performance and scalability.`,

  redis: `## Redis

Redis is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine.

The .NET Aspire Redis integration provides:
- Automatic configuration of Redis connection
- Health checks for Redis connectivity
- Logging and telemetry for Redis operations

Usage example:
\`\`\`csharp
// In the AppHost project
var redis = builder.AddRedis("redis");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(redis);

// In the service project
builder.AddRedisClient("redis");

// Then in your code
public class MyService(IConnectionMultiplexer redisConnection)
{
    // Use the connection
}
\`\`\``,

  redisDistributedCache: `## Redis Distributed Caching

.NET Aspire provides integration with Redis for distributed caching using Microsoft's distributed cache abstractions.

The .NET Aspire Redis Distributed Cache integration provides:
- Automatic configuration of IDistributedCache with Redis implementation
- Health checks for Redis connectivity
- Logging and telemetry for caching operations

Usage example:
\`\`\`csharp
// In the AppHost project
var redis = builder.AddRedis("redis");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(redis);

// In the service project
builder.AddRedisDistributedCache("redis");

// Then in your code
public class MyService(IDistributedCache cache)
{
    // Use the cache
}
\`\`\``,

  redisOutputCache: `## Redis Output Caching

.NET Aspire provides integration with Redis for output caching, which caches the entire output of an HTTP response.

The .NET Aspire Redis Output Cache integration provides:
- Automatic configuration of output caching with Redis
- Health checks for Redis connectivity
- Logging and telemetry for caching operations

Usage example:
\`\`\`csharp
// In the AppHost project
var redis = builder.AddRedis("redis");

var myService = builder.AddProject<Projects.MyService>("myService")
    .WithReference(redis);

// In the service project
builder.AddRedisOutputCache("redis");

// In your controller
[HttpGet("products")]
[OutputCache(Duration = 60)]
public IActionResult GetProducts()
{
    // This response will be cached for 60 seconds
}
\`\`\``
};

// Add a tool for .NET Aspire integrations
server.tool("aspire_integrations",
  { 
    type: z.enum(["overview", "hosting", "client", "features", "cloud-agnostic", "azure", "aws", "community", "all"]).optional()
  },
  async ({ type }) => {
    let content = "";
    
    if (!type || type === "overview") {
      content += integrationData.overview + "\n\n";
    }
    
    if (!type || type === "all" || type === "hosting") {
      content += integrationData.hostingIntegrations + "\n\n";
    }
    
    if (!type || type === "all" || type === "client") {
      content += integrationData.clientIntegrations + "\n\n";
    }
    
    if (!type || type === "all" || type === "features") {
      content += integrationData.features + "\n\n";
    }
    
    if (!type || type === "all" || type === "cloud-agnostic") {
      content += integrationData.cloudAgnostic + "\n\n";
    }
    
    if (!type || type === "all" || type === "azure") {
      content += integrationData.azure + "\n\n";
    }
    
    if (!type || type === "all" || type === "aws") {
      content += integrationData.aws + "\n\n";
    }
    
    if (!type || type === "all" || type === "community") {
      content += integrationData.community + "\n\n";
    }
    
    content += "Source: [.NET Aspire integrations overview](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/integrations-overview)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Add a tool for .NET Aspire service discovery documentation
server.tool("aspire_service_discovery",
  { 
    section: z.enum(["overview", "implicit", "named", "config", "aspire", "kubernetes", "all"]).optional()
  },
  async ({ section }) => {
    let content = "";
    
    if (!section || section === "overview" || section === "all") {
      content += serviceDiscoveryData.overview + "\n\n";
    }
    
    if (!section || section === "implicit" || section === "all") {
      content += serviceDiscoveryData.implicitDiscovery + "\n\n";
    }
    
    if (!section || section === "named" || section === "all") {
      content += serviceDiscoveryData.namedEndpoints + "\n\n";
    }
    
    if (!section || section === "config" || section === "all") {
      content += serviceDiscoveryData.namedEndpointsConfig + "\n\n";
    }
    
    if (!section || section === "aspire" || section === "all") {
      content += serviceDiscoveryData.namedEndpointsAspire + "\n\n";
    }
    
    if (!section || section === "kubernetes" || section === "all") {
      content += serviceDiscoveryData.kubernetes + "\n\n";
    }
    
    content += "Source: [.NET Aspire service discovery](https://learn.microsoft.com/en-us/dotnet/aspire/service-discovery/overview)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Add a tool for .NET Aspire storage integrations
server.tool("aspire_storage",
  { 
    type: z.enum(["overview", "azure-blob", "azure-queues", "azure-tables", "persist-volume", "all"]).optional()
  },
  async ({ type }) => {
    let content = "";
    
    if (!type || type === "overview" || type === "all") {
      content += storageData.overview + "\n\n";
    }
    
    if (!type || type === "azure-blob" || type === "all") {
      content += storageData.azureBlob + "\n\n";
    }
    
    if (!type || type === "azure-queues" || type === "all") {
      content += storageData.azureQueues + "\n\n";
    }
    
    if (!type || type === "azure-tables" || type === "all") {
      content += storageData.azureTables + "\n\n";
    }
    
    if (!type || type === "persist-volume" || type === "all") {
      content += storageData.persistVolume + "\n\n";
    }
    
    content += "Source: [.NET Aspire Storage Integrations](https://learn.microsoft.com/en-us/dotnet/aspire/storage/)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Add a tool for .NET Aspire database integrations
server.tool("aspire_databases",
  { 
    type: z.enum(["overview", "sqlserver", "postgres", "cosmos", "mongodb", "mysql", "all"]).optional()
  },
  async ({ type }) => {
    let content = "";
    
    if (!type || type === "overview" || type === "all") {
      content += databaseData.overview + "\n\n";
    }
    
    if (!type || type === "sqlserver" || type === "all") {
      content += databaseData.sqlServer + "\n\n";
    }
    
    if (!type || type === "postgres" || type === "all") {
      content += databaseData.postgres + "\n\n";
    }
    
    if (!type || type === "cosmos" || type === "all") {
      content += databaseData.cosmos + "\n\n";
    }
    
    if (!type || type === "mongodb" || type === "all") {
      content += databaseData.mongodb + "\n\n";
    }
    
    if (!type || type === "mysql" || type === "all") {
      content += databaseData.mysql + "\n\n";
    }
    
    content += "Source: [.NET Aspire Database Integrations](https://learn.microsoft.com/en-us/dotnet/aspire/database/)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Add a tool for .NET Aspire messaging integrations
server.tool("aspire_messaging",
  { 
    type: z.enum(["overview", "azure-service-bus", "rabbitmq", "kafka", "nats", "azure-event-hubs", "all"]).optional()
  },
  async ({ type }) => {
    let content = "";
    
    if (!type || type === "overview" || type === "all") {
      content += messagingData.overview + "\n\n";
    }
    
    if (!type || type === "azure-service-bus" || type === "all") {
      content += messagingData.azureServiceBus + "\n\n";
    }
    
    if (!type || type === "rabbitmq" || type === "all") {
      content += messagingData.rabbitmq + "\n\n";
    }
    
    if (!type || type === "kafka" || type === "all") {
      content += messagingData.kafka + "\n\n";
    }
    
    if (!type || type === "nats" || type === "all") {
      content += messagingData.nats + "\n\n";
    }
    
    if (!type || type === "azure-event-hubs" || type === "all") {
      content += messagingData.azureEventHubs + "\n\n";
    }
    
    content += "Source: [.NET Aspire Messaging Integrations](https://learn.microsoft.com/en-us/dotnet/aspire/messaging/)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Add a tool for .NET Aspire caching integrations
server.tool("aspire_caching",
  { 
    type: z.enum(["overview", "redis", "redis-distributed-cache", "redis-output-cache", "all"]).optional()
  },
  async ({ type }) => {
    let content = "";
    
    if (!type || type === "overview" || type === "all") {
      content += cachingData.overview + "\n\n";
    }
    
    if (!type || type === "redis" || type === "all") {
      content += cachingData.redis + "\n\n";
    }
    
    if (!type || type === "redis-distributed-cache" || type === "all") {
      content += cachingData.redisDistributedCache + "\n\n";
    }
    
    if (!type || type === "redis-output-cache" || type === "all") {
      content += cachingData.redisOutputCache + "\n\n";
    }
    
    content += "Source: [.NET Aspire Caching Integrations](https://learn.microsoft.com/en-us/dotnet/aspire/caching/)";
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);