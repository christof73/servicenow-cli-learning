# VS Code Setup Guide for ServiceNow Development

## ⚠️ Important Notice: Extension Deprecation

**The ServiceNow VS Code Extension is being deprecated.** ServiceNow is focusing on their ServiceNow IDE instead. While the extension still works, we recommend focusing on the **ServiceNow CLI** for long-term development.

## Extensions Installed ✓

- **ServiceNow Extension** (v1.7.0) - Installed (being deprecated)
- **Fluent Language Extension** (v2.0.3) - Installed
- **ServiceNow CLI** (v29.0.2) - **Recommended for new development**

## Configuration Complete ✓

Your workspace is configured in `.vscode/settings.json` with:
- **Instance URL**: `https://dev294409.service-now.com`
- **Username**: `mcp.server`
- **Password**: Configured (using basic auth)
- **Developer mode**: Enabled
- **Auto-formatting**: On save
- **ESLint integration**: Enabled

## Quick Start

### Option A: ServiceNow CLI (Recommended)

The CLI is the **future-proof** way to develop ServiceNow applications:

```bash
# Open the project
cd /Users/christopherthompson/claude-projects/servicenow-cli-learning

# Create a new UI component
snc ui-component create --name my-component

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to instance
npm run deploy
```

### Option B: ServiceNow VS Code Extension

If you want to use the extension (for editing existing scripts):

1. **Open VS Code** in this project:
   ```bash
   cd /Users/christopherthompson/claude-projects/servicenow-cli-learning
   code .
   ```

2. **Reload VS Code** to pick up the settings:
   - Press `Cmd+Shift+P` → Type: `Developer: Reload Window`

3. **Activate the Extension**:
   - Press `Cmd+Shift+P` → Type: `Now: Activate Now Extension`

4. **Set up Workspace** (if needed):
   - Press `Cmd+Shift+P` → Type: `Now: Setup Now Workspace`

## Available VS Code Extension Commands

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to access:

| Command | Description |
|---------|-------------|
| `Now: Activate Now Extension` | Activate the ServiceNow extension |
| `Now: Setup Now Workspace` | Set up workspace for ServiceNow development |
| `Now: Create Now Project` | Create a new ServiceNow project |
| `Now: Select update set` | Choose which update set to use |

**Right-click context menu additions:**
- **Copy Sys_id** - Copy record system ID
- **Open in Platform** - Open record in ServiceNow web UI

## What You Can Do

### 1. Build Modern Applications (CLI - Recommended)

Create and develop Now Experience UI components:

```bash
# Create a new UI component
snc ui-component create --name my-component

# Create a new scoped application
snc create --project-name my-app

# Develop with hot reload
snc ui-component develop

# Build for production
snc ui-component build

# Deploy to your instance
snc ui-component deploy
```

### 2. Use IntelliSense for ServiceNow APIs

With the extension activated, you get:
- Auto-completion for Glide APIs (GlideRecord, GlideForm, etc.)
- JavaScript API suggestions
- Code snippets for common patterns
- Syntax highlighting for ServiceNow-specific code

### 3. Access Instance Tools

The extension provides quick access to:
- API Explorer
- Update Sets
- System logs

### 4. Work with the ServiceNow SDK

Use the `@servicenow/sdk` package (already installed) for API integration:

```javascript
const { ServiceNowClient } = require('@servicenow/sdk');

const client = new ServiceNowClient({
  instance: 'dev294409',
  auth: {
    username: 'mcp.server',
    password: 'your-password'
  }
});

// Example: Get incidents
async function getIncidents() {
  const incidents = await client.table('incident').get({
    sysparm_limit: 10
  });
  console.log(incidents);
}
```

## File Structure

```
servicenow-cli-learning/
├── .vscode/
│   ├── settings.json          # VS Code workspace settings
│   └── extensions.json        # Recommended extensions
├── node_modules/              # Dependencies
├── package.json               # Project configuration
├── VSCODE_SETUP.md           # This guide
└── [Your ServiceNow files]    # Pulled scripts will appear here
```

## Recommended Workflows

### For New Applications
**Use the ServiceNow CLI** - It's the officially supported, future-proof approach:
- Better integration with modern development tools
- Source control friendly (Git)
- Local development with hot reload
- Supports Now Experience Framework

### For Learning ServiceNow APIs
**Use the VS Code Extension** for IntelliSense:
- Great auto-completion for Glide APIs
- Code snippets for common patterns
- Helps you learn the ServiceNow API surface

### For Production Development
Consider migrating to **ServiceNow IDE** (the future direction) or continue with the **CLI** for long-term maintainability.

## Troubleshooting

### Extension Not Activating
- Reload VS Code: `Cmd+Shift+P` → `Developer: Reload Window`
- Check extension is installed: View → Extensions → Search "ServiceNow"
- Run: `Now: Activate Now Extension`

### IntelliSense Not Working
- Ensure extension is activated (check status bar)
- Reload window: `Cmd+Shift+P` → `Developer: Reload Window`
- Check that `.vscode/settings.json` has correct instance URL

### CLI Commands Not Working
- Verify `@servicenow/cli` is installed: `npm list @servicenow/cli`
- Check Node.js version: `node --version` (should be v20.18.0+)
- Try reinstalling: `npm install @servicenow/cli --save-dev`

### Can't Connect to Instance
- Verify credentials in `.vscode/settings.json`
- Test instance accessibility: `curl https://dev294409.service-now.com`
- Ensure you have API access enabled on the instance

## Manual Configuration (If Needed)

If the extension doesn't connect automatically, add your credentials to `.vscode/settings.json`:

```json
{
  "now.instance.user.name": "mcp.server",
  "now.instance.host.url": "https://dev294409.service-now.com",
  "now.instance.user.password": "your-password-here",
  "now.instance.OAuth.client.id": "",
  "now.instance.OAuth.client.secret": ""
}
```

**Note**: The credentials in `.vscode/settings.json` are in plain text. Consider:
- Adding `.vscode/settings.json` to `.gitignore` if you commit this project
- Using environment variables instead for production workflows
- Using OAuth for more secure authentication

## Additional Resources

- [ServiceNow VS Code Extension Docs](https://www.servicenow.com/docs/bundle/zurich-application-development/page/build/applications/concept/vs-code.html)
- [ServiceNow CLI Guide](https://developer.servicenow.com/dev.do#!/reference/now-cli/utah/now-cli-commands)
- [ServiceNow SDK Documentation](https://developer.servicenow.com/dev.do#!/reference/now-cli/utah/now-cli-sdk)
- [VS Code Setup Community Article](https://www.servicenow.com/community/developer-articles/vs-code-setup-for-servicenow/ta-p/2324907)
- [Extension FAQ](https://www.servicenow.com/community/developer-articles/faq-for-v1-5-0-servicenow-vs-code-extension/ta-p/2308333)

## Your Development Environment

- **Instance**: dev294409.service-now.com
- **User**: mcp.server
- **MCP Server**: ✓ Configured and running
- **SDK**: ✓ Installed (@servicenow/sdk v4.2.0)
- **CLI**: ✓ Installed (@servicenow/cli v29.0.2)
- **Extensions**: ✓ ServiceNow (v1.7.0), Fluent Language (v2.0.3)

## Summary: Which Tool to Use?

| Use Case | Recommended Tool |
|----------|------------------|
| **Build new Now Experience apps** | ServiceNow CLI (`snc` commands) |
| **Learn ServiceNow APIs** | VS Code Extension (IntelliSense) |
| **Quick prototyping** | ServiceNow CLI |
| **Enterprise development** | ServiceNow CLI + Git workflow |
| **API integration** | @servicenow/sdk package |
| **Future-proof development** | ServiceNow CLI (extension is deprecated) |

---

**Next Steps**:
1. Open VS Code: `code .`
2. Try creating a component: `snc ui-component create --name hello-world`
3. Start developing: `npm run dev`
