# ServiceNow CLI Learning

A learning and experimentation project for ServiceNow platform development using the ServiceNow CLI and UI Component framework.

## Overview

This project contains UI components built with the ServiceNow UI Framework for hands-on learning and proof-of-concept development.

## Components

- **x-143767-hello-world** - Basic hello world component demonstrating core concepts
- **x-143767-hello-wazzup** - Interactive counter component with state management
- **x-143767-fluent-poc** - Task manager demonstrating modern UI patterns (Fluent design inspiration)

## Tech Stack

- **ServiceNow CLI** - Command-line interface for component development and deployment
- **ServiceNow UI Framework** - Component framework (@servicenow/ui-core)
- **Snabbdom** - Virtual DOM renderer
- **SCSS** - Styling

## Prerequisites

- Node.js (v18+)
- ServiceNow CLI (`@servicenow/cli`)
- ServiceNow Developer Instance
- ServiceNow account with appropriate roles (ui_builder, admin)

## Installation

```bash
# Install dependencies
npm install

# Configure ServiceNow CLI profile
snc configure profile set
```

When prompted:
- Host: Your ServiceNow instance URL (e.g., https://devXXXXXX.service-now.com)
- Login method: Basic
- Username: Your ServiceNow username
- Password: Your ServiceNow password

## Project Structure

```
servicenow-cli-learning/
├── src/
│   ├── index.js                      # Entry point (imports all components)
│   ├── x-143767-hello-world/         # Hello World component
│   │   ├── index.js
│   │   └── styles.scss
│   ├── x-143767-hello-wazzup/        # Counter component
│   │   ├── index.js
│   │   └── styles.scss
│   └── x-143767-fluent-poc/          # Task Manager POC
│       ├── index.js
│       └── styles.scss
├── package.json                       # Project dependencies
├── now-ui.json                        # Component metadata and configuration
└── .gitignore                         # Git ignore rules
```

## Development Workflow

### Build Components

```bash
npm run build
```

Compiles components and bundles assets for deployment.

### Deploy to ServiceNow

```bash
npm run deploy
```

Deploys all components to your configured ServiceNow instance. The deploy command **builds and deploys in one step** — you do not need to run `build` separately before deploying.

### Development Mode (Local)

```bash
npm run dev
```

Starts local development server (if configured).

### Updating Components on the Instance

Every time you make code changes, you must redeploy to push updates to ServiceNow. The CLI will update existing records in place — it does not duplicate or break previously deployed components.

**Full workflow for updating a component:**

```bash
# 1. Edit your component code (index.js, styles.scss)
#    Make your changes...

# 2. Deploy (builds automatically, then pushes to instance)
npm run deploy

# 3. Verify in ServiceNow
#    - Open UI Builder
#    - Open or refresh any page using the component
#    - Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R)
```

**What `npm run deploy` does on an update:**
- Recompiles all JS and SCSS
- Pushes updated asset bundles (`sys_ux_lib_asset`)
- Updates component metadata if `now-ui.json` changed
- Does **not** delete or recreate the component records

**Adding a new component to an existing deployment:**

```bash
# 1. Create the component directory and files
mkdir src/x-143767-my-new-component
# Add index.js and styles.scss...

# 2. Register it in src/index.js
#    Add: import './x-143767-my-new-component';

# 3. Register it in now-ui.json under "components": { ... }

# 4. Deploy
npm run deploy
```

**Verifying changes took effect:**
- Components are cached in the browser. After deploying, always do a **hard refresh** in ServiceNow (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- If UI Builder is open, close and reopen the page

## Using Components in ServiceNow

1. Log into your ServiceNow instance
2. Navigate to **All** → **UI Builder**
3. Create or open a page/experience
4. Find your components in the component toolbox:
   - "Hello World"
   - "Hello Wazzup"
   - "Fluent Task Manager POC"
5. Drag components onto the page canvas
6. Preview and test

## Important Notes

### Vendor Prefix

All components use the vendor prefix `x-143767-` which is specific to the ServiceNow developer instance. If you're using a different instance, you'll need to:

1. Find your instance's vendor prefix in ServiceNow Studio
2. Rename all component directories (e.g., `x-YOUR-PREFIX-component-name`)
3. Update component names in:
   - Component directory names
   - `src/index.js` imports
   - Each component's `createCustomElement()` call
   - `now-ui.json` component keys

### Scope Name

The scope name in `now-ui.json` (`x_143767_learning`) must match your instance's vendor prefix format:
- Use underscores (not hyphens)
- Format: `x_{vendor}_descriptive_name`
- Minimum 8 characters

## Component Examples

### Fluent Task Manager POC

A fully functional task management component demonstrating:
- State management with reactive updates
- Event handling (input, click, keypress)
- Conditional rendering
- Array operations (map, filter)
- Modern Fluent-inspired UI design

**Features:**
- Add tasks via input field
- Toggle task completion
- Delete individual tasks
- Clear all tasks
- Real-time statistics (total, completed, pending)
- Keyboard support (Enter to add)

## Learning Resources

- [ServiceNow CLI Documentation](https://docs.servicenow.com/bundle/latest/page/build/servicenow-cli/concept/servicenow-cli.html)
- [UI Framework Developer Guide](https://developer.servicenow.com/dev.do#!/guides/vancouver/now-experience/ui-framework/introduction)
- [ServiceNow UI Component Setup Guide](https://github.com/christof73/claude-learning/tree/main/_project-guides/servicenow-ui-component-setup.md)

## Troubleshooting

### Deployment Fails with "Component tag name must start with..."

Your instance requires a different vendor prefix. Find yours in ServiceNow Studio and update all component names accordingly.

### "Unable to find entry path"

Ensure `package.json` has the `"module": "./src/index.js"` property.

### "401 Unauthorized"

Reconfigure your CLI profile:
```bash
snc configure profile set
```

### Components Don't Show in UI Builder

1. Verify deployment succeeded
2. Check `now-ui.json` has `"uiBuilder"` configuration
3. Ensure user has required roles
4. Refresh UI Builder

## License

ISC

## Author

Learning project for ServiceNow platform development
