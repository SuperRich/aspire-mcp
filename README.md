# .NET Aspire MCP Documentation Server

This is a Model Context Protocol (MCP) server that provides comprehensive documentation for .NET Aspire.

## Overview

The server uses the MCP protocol to provide detailed information about various .NET Aspire features and integrations. It's designed to be used with MCP-compatible clients like language models to provide accurate and detailed information about .NET Aspire.

## Available Documentation Tools

The server provides the following documentation tools:

1. **aspire_integrations** - Information about .NET Aspire integrations
2. **aspire_service_discovery** - Information about .NET Aspire service discovery
3. **aspire_storage** - Information about .NET Aspire storage integrations
4. **aspire_databases** - Information about .NET Aspire database integrations
5. **aspire_messaging** - Information about .NET Aspire messaging integrations
6. **aspire_caching** - Information about .NET Aspire caching integrations

Each tool can be queried with specific parameters to get information about particular topics.

## Installation

```bash
# Install dependencies
npm install
```

## Usage

```bash
# Build the project
npm run build

# Start the server
npm run start
```

## Development

```bash
# Build and run for development
npm run dev
```

## Source References

All information provided by this server is sourced from the official Microsoft documentation:
- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [.NET Aspire Integrations Overview](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/integrations-overview)
- [.NET Aspire Service Discovery](https://learn.microsoft.com/en-us/dotnet/aspire/service-discovery/overview)

## License

MIT 