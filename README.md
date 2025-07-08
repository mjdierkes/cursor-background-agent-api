# Cursor Background Agent API Client

> **Powerful Node.js API client and CLI tool for Cursor Background Composer automation**

A TypeScript-based API client that provides programmatic access to Cursor's Background Composer functionality. Create, manage, and monitor background coding tasks with both CLI and MCP (Model Context Protocol) server support.

## Features

- **CLI Interface** - Command-line tool for managing background composers
- **MCP Server** - Model Context Protocol server for AI assistant integration  
- **TypeScript Support** - Full type safety and IntelliSense
- **Background Composer Management** - Create, list, and monitor coding tasks
- **User Settings Control** - Manage privacy mode and web access settings
- **Repository Integration** - Automatic Git repository detection
- **Multiple Output Formats** - JSON, table, and raw output formats

## Installation

```bash
npm install -g cursor-api-client
```

Or clone and build locally:

```bash
git clone https://github.com/mjdierkes/cursor-background-agent-api.git
cd cursor-background-agent-api
npm install
npm run build
```

## Setup

### 1. Get Your Session Token

You need a Cursor session token to authenticate API requests:

**Option A: Environment Variable (Recommended)**
```bash
export CURSOR_SESSION_TOKEN="your_session_token_here"
```

**Option B: Cookies File**
Create a `cookies.json` file with your Cursor session cookies:
```json
[
  {
    "name": "WorkosCursorSessionToken", 
    "value": "your_session_token_here"
  }
]
```

### 2. Verify Setup

Test your configuration:
```bash
cursor-api test
```

## CLI Usage

### List Background Composers
```bash
cursor-api list
cursor-api list --format json
```

### Create Background Composer
```bash
cursor-api create --task-description "Add user authentication to the app"
cursor-api create -d "Fix bug in payment processing" -r "https://github.com/user/repo.git"
```

### Get Composer Details
```bash
cursor-api details --composer-id "your-composer-id"
```

### Check Settings
```bash
cursor-api web-access    # Check agent web access
cursor-api privacy       # Check privacy mode settings  
cursor-api settings      # Get user settings
```

### Available Commands
- `list` - List all background composers
- `create` - Create new background composer task
- `details` - Get detailed composer information
- `web-access` - Check agent web access status
- `privacy` - Get privacy mode settings
- `settings` - Get user settings
- `test` - Test all API endpoints
- `mcp-server` - Start MCP server

### Global Options
- `--format, -f` - Output format: json, table, raw (default: table)
- `--verbose, -v` - Enable verbose logging
- `--token, -T` - Override session token
- `--help, -h` - Show help

## MCP Server

Start the Model Context Protocol server for AI assistant integration:

```bash
cursor-api mcp-server
cursor-api mcp-server --port 3001
```

The MCP server provides:
- **Endpoint**: `http://localhost:3001/mcp`
- **Health Check**: `http://localhost:3001/health`
- **CORS Support** - Cross-origin requests enabled
- **Session Management** - Stateless request handling

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CURSOR_SESSION_TOKEN` | Cursor session token | Required |
| `CURSOR_BASE_URL` | Cursor API base URL | `https://cursor.com` |
| `REQUEST_TIMEOUT` | Request timeout (ms) | `30000` |
| `MAX_RETRIES` | Maximum retry attempts | `3` |
| `LOG_LEVEL` | Logging level | `info` |

## GitHub Workflow Integration

Automatically trigger background agents for every new issue with the included GitHub Actions workflow.

### Setup

1. **Add the workflow file** (already included in this repository):
   - `.github/workflows/issue-background-agent.yml`

2. **Configure the Cursor session token secret**:
   - Go to your repository's Settings > Secrets and variables > Actions
   - Add a new repository secret named `CURSOR_SESSION_TOKEN`
   - Set the value to your Cursor session token

3. **Enable the workflow**:
   - The workflow will automatically trigger when new issues are created
   - It will analyze the issue and create a background composer task
   - A comment will be posted on the issue confirming the agent was triggered

### How it Works

When a new issue is created, the workflow:
1. Makes a direct API call to Cursor's background composer endpoint
2. Passes the complete issue information (title, body, author, labels, URL)
3. Posts a comment on the issue confirming the agent was triggered

The background agent will receive:
- Issue title and description
- Author information
- Labels
- Repository context
- Direct link to the issue

Results will be available in the Cursor Background Composer interface.

### Workflow Features

- **Automatic Triggering** - Runs on every new issue
- **Fast Execution** - Direct API call with no setup steps
- **Rich Context** - Passes complete issue information to the agent
- **User Feedback** - Comments on the issue to confirm activation
- **Repository Aware** - Uses the current repository URL automatically

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start MCP server in development
npm run mcp-server:dev
```

## API Client Usage

```typescript
import { CursorAPIClient } from 'cursor-api-client';

const client = new CursorAPIClient('your-session-token');

// Create background composer
const result = await client.createBackgroundComposer({
  taskDescription: 'Add user authentication',
  repositoryUrl: 'https://github.com/user/repo.git',
  branch: 'main',
  model: 'claude-4-sonnet-thinking'
});

// List composers
const composers = await client.listComposers();

// Get settings
const settings = await client.getUserSettings();
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Keywords

`cursor`, `background-composer`, `api-client`, `cli`, `mcp-server`, `automation`, `typescript`, `nodejs`
