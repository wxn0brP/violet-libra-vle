# Violet Libra Extension (VLE)

A VS Code extension that publishes Markdown files to your Violet Libra (VL) server directly from the editor.

## Features

- Publish Markdown files to your VL server with a single command
- Support for metadata configuration using JSON
- Customizable publish configuration per project
- Automatic handling of tags, descriptions, privacy settings, and scheduling

## Installation

1. Download the extension from the VS Code marketplace (when available) or install from a .vsix file
2. Reload VS Code

## Usage

### Prerequisites

1. Create a `publish-config.json` file in your project root with the following structure:

```json
{
  "url": "https://your-vl-server.com/api",
  "query": {
    "token": "your-api-token"
  },
  "headers": {
    "Authorization": "Bearer your-authorization-token"
  }
}
```

### Publishing a Markdown File

1. Open your Markdown file in VS Code
2. Add metadata at the beginning of the file in JSON format, separated from the content by `;;;`
3. Example file structure:

```json
{
  "name": "my-markdown-file",
  "tags": ["documentation", "tutorial"],
  "desc": "A brief description of this content",
  "private": false,
  "scheduled": 1700000000000
}
;;;
# Your Markdown Content

This is the actual content that will be published to your VL server.
```

3. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run "Publish VL Markdown"
4. Alternatively, bind the `nya.publishMarkdown` command to a keyboard shortcut

### Metadata Options

- `name`: The unique identifier for the content on your server (required)
- `tags`: Array of tags to associate with the content
- `desc`: Description of the content
- `private`: Set to `true` to make the content private
- `scheduled`: Unix timestamp (in milliseconds) for when to publish the content

## Configuration

The extension reads configuration from a `publish-config.json` file in your project root:

- `url`: The API endpoint for your VL server
- `query`: Additional query parameters to include in the request
- `headers`: HTTP headers to include with the request (e.g., authentication)

## Commands

- `nya.publishMarkdown`: Publish the currently active Markdown file to your VL server

## Requirements

- VS Code version 1.105.0 or higher

## Extension Settings

This extension does not contribute any settings.

## License

MIT

## Contributing

Contributing are welcome!