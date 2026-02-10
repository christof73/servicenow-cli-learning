# ServiceNow Now Experience Framework Guide

**Last Updated:** 2026-02-09
**Purpose:** Understanding how the Now Experience UI Framework is structured and how to build applications with it
**Prerequisite:** Basic JavaScript/JSX familiarity

---

## Table of Contents

1. [What Is the Now Experience Framework?](#1-what-is-the-now-experience-framework)
2. [The Big Picture: How Things Are Wired](#2-the-big-picture-how-things-are-wired)
3. [The Core Primitive: createCustomElement](#3-the-core-primitive-createcustomelement)
4. [State: The Heart of a Component](#4-state-the-heart-of-a-component)
5. [The View Function](#5-the-view-function)
6. [Properties: Inputs from Outside](#6-properties-inputs-from-outside)
7. [Actions and Action Handlers: Events That Do Things](#7-actions-and-action-handlers-events-that-do-things)
8. [Parent-Child Communication](#8-parent-child-communication)
9. [Lifecycle Hooks](#9-lifecycle-hooks)
10. [Async Operations and Side Effects](#10-async-operations-and-side-effects)
11. [Building a Complete Application](#11-building-a-complete-application)
12. [Deploying to ServiceNow and UI Builder](#12-deploying-to-servicenow-and-ui-builder)
13. [Mental Model Summary](#13-mental-model-summary)

---

## 1. What Is the Now Experience Framework?

The Now Experience (sometimes called "Next Experience") framework is ServiceNow's proprietary component system for building UI components that run inside the ServiceNow platform. It sits on top of the **Web Components standard** — meaning every component you create is a native custom HTML element that the browser understands.

Think of it as a structured wrapper around Web Components that adds:
- **Reactive state management** (like React's useState)
- **An action/event system** (like Redux actions)
- **A virtual DOM renderer** via Snabbdom
- **Integration hooks** for UI Builder and the ServiceNow platform

### The Key Packages

| Package | Role |
|---------|------|
| `@servicenow/ui-core` | The framework engine — creates components, manages state, handles actions |
| `@servicenow/ui-renderer-snabbdom` | Renders the virtual DOM (JSX → real DOM) |
| `@servicenow/sdk` | ServiceNow platform API access from within components |
| `@servicenow/cli` | CLI tooling to build and deploy components |

---

## 2. The Big Picture: How Things Are Wired

Before writing any code, it helps to understand the complete data flow:

```
┌──────────────────────────────────────────────────────────────────┐
│                     NOW EXPERIENCE COMPONENT                     │
│                                                                  │
│  ┌─────────────┐    dispatch()   ┌────────────────────────────┐  │
│  │    VIEW     │ ─────────────→  │    ACTION HANDLERS         │  │
│  │  (JSX/HTML) │                 │  (side effects, API calls) │  │
│  │             │ ←─ updateState─ │                            │  │
│  └──────┬──────┘                 └────────────────────────────┘  │
│         │ reads                                                   │
│  ┌──────▼──────┐                                                  │
│  │    STATE    │ ←─── initialState (set at startup)               │
│  │  (plain JS  │ ←─── updateState() (from view or handlers)       │
│  │   object)   │                                                  │
│  └─────────────┘                                                  │
│                                                                   │
│  ┌─────────────┐                                                  │
│  │ PROPERTIES  │ ←─── Set by parent component or UI Builder       │
│  │ (external   │ ─────────────────────────────────────────────→   │
│  │  inputs)    │      (available in view function)                │
│  └─────────────┘                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**The key insight:** A component is essentially a loop:

1. **State** defines what the component knows
2. **View** reads state and renders HTML
3. **User interactions** in the view either:
   - Call `updateState()` directly (for simple state changes)
   - Call `dispatch()` to trigger an action handler (for complex/async logic)
4. **State changes** cause the view to re-render
5. Repeat

---

## 3. The Core Primitive: createCustomElement

Everything starts with `createCustomElement`. It registers your component as a native web component and wires together all the pieces.

```javascript
import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

createCustomElement('x-143767-my-component', {
  // --- REQUIRED ---
  renderer: { type: snabbdom },   // The rendering engine
  view,                           // Function that returns the UI

  // --- OPTIONAL: State ---
  initialState: { count: 0 },

  // --- OPTIONAL: External inputs ---
  properties: { label: { default: 'Click me' } },

  // --- OPTIONAL: Custom events this component can emit ---
  actions: {
    ITEM_SELECTED: { schema: { type: 'object' } }
  },

  // --- OPTIONAL: Respond to actions ---
  actionHandlers: {
    ITEM_SELECTED: (effect, { updateState }) => { /* ... */ }
  },

  // --- OPTIONAL: Styles ---
  styles,

  // --- OPTIONAL: Lifecycle ---
  onConnect: (host) => { /* runs when added to DOM */ },
  onDisconnect: (host) => { /* runs when removed */ }
});
```

### The Naming Rule

Component names must follow the Web Components standard: **two words separated by a hyphen**, starting with your vendor prefix:

```
x-{vendor-number}-{component-name}
x-143767-task-list      ✅
x-143767-card-item      ✅
mything                 ❌  (no hyphen)
x-mycomp                ❌  (only one hyphen segment)
```

---

## 4. State: The Heart of a Component

State is a plain JavaScript object that holds everything the component needs to remember. When state changes, the view automatically re-renders.

### Defining Initial State

```javascript
createCustomElement('x-143767-counter', {
  // ...
  initialState: {
    count: 0,
    message: 'Hello!',
    items: [],
    isLoading: false
  }
});
```

### Reading State in the View

The view function receives state as its first argument:

```javascript
const view = (state, { updateState }) => {
  const { count, message } = state;   // destructure for convenience

  return (
    <div>
      <h1>{message}</h1>
      <p>Count: {count}</p>
    </div>
  );
};
```

### Updating State

Use `updateState()` from the second argument of the view function. It **merges** the object you pass into the current state (shallow merge — like `Object.assign`):

```javascript
// Before: state = { count: 5, message: 'Hello' }
updateState({ count: 6 });
// After:  state = { count: 6, message: 'Hello' }  ← message preserved
```

### Common State Patterns

**Updating a value:**
```javascript
updateState({ count: count + 1 });
```

**Updating a nested value:**
```javascript
// Use spread to preserve other keys in a nested object
updateState({ user: { ...state.user, name: 'Alice' } });
```

**Updating an array (add item):**
```javascript
updateState({
  tasks: [...tasks, { id: Date.now(), text: newText }]
});
```

**Updating an array (remove item):**
```javascript
updateState({
  tasks: tasks.filter(task => task.id !== targetId)
});
```

**Updating an array (toggle item):**
```javascript
updateState({
  tasks: tasks.map(task =>
    task.id === targetId ? { ...task, done: !task.done } : task
  )
});
```

---

## 5. The View Function

The view function is the only place that produces HTML. It runs every time state changes and returns a virtual DOM tree using JSX.

### Signature

```javascript
const view = (state, coeffects) => {
  // destructure what you need from coeffects
  const { updateState, dispatch } = coeffects;

  return (
    <div>...</div>
  );
};
```

### JSX Event Handling

Now Experience uses Snabbdom, which uses an `on-` prefix for events (not React's `onClick` camelCase):

```javascript
// Click
<button on-click={() => updateState({ clicked: true })}>
  Click me
</button>

// Text input
<input
  on-input={(e) => updateState({ text: e.target.value })}
/>

// Keyboard
<input
  on-keypress={(e) => {
    if (e.key === 'Enter') addItem();
  }}
/>

// Checkbox
<input
  type="checkbox"
  checked={isComplete}
  on-change={(e) => updateState({ isComplete: e.target.checked })}
/>
```

### Conditional Rendering

```javascript
// Ternary for either/or
{isLoading ? <p>Loading...</p> : <div>{content}</div>}

// Short-circuit for optional content
{error && <p className="error">{error}</p>}

// If/else via function
{(() => {
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <Content data={data} />;
})()}
```

### List Rendering

```javascript
{items.map(item => (
  <div className="item" key={item.id}>
    <span>{item.name}</span>
    <button on-click={() => removeItem(item.id)}>Remove</button>
  </div>
))}
```

**Always use `key`** on list items so Snabbdom can efficiently update the DOM.

### Derived Values in the View

Compute values from state directly in the view — no need for a separate "selector" pattern unless the calculation is expensive:

```javascript
const view = (state) => {
  const { tasks } = state;

  // Derived directly in the view
  const completedCount = tasks.filter(t => t.done).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div>
      <p>Done: {completedCount} | Pending: {pendingCount}</p>
    </div>
  );
};
```

---

## 6. Properties: Inputs from Outside

Properties are values set on your component from **outside** — by a parent component, UI Builder, or a page configuration. Think of them like HTML attributes or React props.

### Defining Properties

```javascript
createCustomElement('x-143767-card', {
  // ...
  properties: {
    title: {
      default: 'Untitled'           // Value used if not provided
    },
    count: {
      default: 0
    },
    items: {
      default: []
    },
    onItemClick: {
      default: null                 // Can hold a callback
    }
  }
});
```

### Using Properties in the View

Properties come through the `coeffects` object, not the state:

```javascript
const view = (state, { updateState, properties }) => {
  const { title, count } = properties;

  return (
    <div>
      <h2>{title}</h2>
      <p>External count: {count}</p>
    </div>
  );
};
```

### Setting Properties From Outside

In JSX (parent component):
```javascript
<x-143767-card title="My Card" count={5}></x-143767-card>
```

In UI Builder: Through the component's property panel on the right side.

### Properties vs State: The Key Difference

| | State | Properties |
|---|---|---|
| **Defined by** | The component itself | The parent or UI Builder |
| **Modified by** | `updateState()` inside the component | The parent changes its value |
| **Purpose** | Internal memory | External configuration/data |

---

## 7. Actions and Action Handlers: Events That Do Things

Actions are the mechanism for handling **complex logic** — especially anything that involves async operations, API calls, or multi-step state changes. They follow a pattern similar to Redux.

### Why Use Actions Instead of Direct `updateState`?

Use `updateState()` directly for **simple, synchronous** state changes:
```javascript
// Simple — just update the state directly
<button on-click={() => updateState({ count: count + 1 })}>+</button>
```

Use `dispatch()` + action handlers for:
- **Async operations** (API calls, timers)
- **Multi-step logic** that updates state in stages
- **Events you want to bubble** to parent components
- **Operations that other components need to listen to**

### Defining Actions (Events Your Component Emits)

```javascript
createCustomElement('x-143767-search', {
  // ...
  actions: {
    SEARCH_SUBMITTED: {},          // no payload schema required
    ITEM_SELECTED: {
      schema: {                    // optional: validates dispatch payload
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }
});
```

### Dispatching Actions

```javascript
const view = (state, { dispatch }) => (
  <button on-click={() => dispatch('ITEM_SELECTED', { id: '123' })}>
    Select
  </button>
);
```

### Handling Actions: Responding to Events

```javascript
createCustomElement('x-143767-search', {
  // ...
  actionHandlers: {
    // Simple function handler
    'SEARCH_SUBMITTED': (effect, { updateState, dispatch }) => {
      updateState({ isLoading: true });

      fetchResults(state.query)
        .then(results => {
          updateState({ results, isLoading: false });
        })
        .catch(err => {
          updateState({ error: err.message, isLoading: false });
        });
    }
  }
});
```

### The `coeffects` Object in Action Handlers

The second argument to every action handler contains helpers:

```javascript
actionHandlers: {
  'MY_ACTION': (effect, coeffects) => {
    const {
      updateState,    // Update component state
      dispatch,       // Dispatch another action
      action,         // The action that was dispatched { type, payload }
      state,          // Current component state (read-only)
      properties      // Current component properties (read-only)
    } = coeffects;
  }
}
```

### Action Bubbling

By default, dispatched actions **bubble up** through parent components — similar to how DOM events bubble. This lets parent components listen to events from deeply nested children.

Stop bubbling when the action is purely internal:
```javascript
dispatch('INTERNAL_UPDATE', { value: 5 }, { stopPropagation: true });
```

---

## 8. Parent-Child Communication

### Pattern 1: Parent → Child via Properties

```javascript
// Parent component's view
const view = (state, { updateState }) => {
  const { selectedId } = state;

  return (
    <div>
      <x-143767-item-list
        selected-id={selectedId}
        on-item-click={(e) => updateState({ selectedId: e.detail.id })}
      ></x-143767-item-list>
    </div>
  );
};
```

```javascript
// Child component
createCustomElement('x-143767-item-list', {
  properties: {
    selectedId: { default: null }
  },
  view: (state, { properties, dispatch }) => {
    const items = ['a', 'b', 'c'];
    return (
      <ul>
        {items.map(id => (
          <li
            className={id === properties.selectedId ? 'selected' : ''}
            on-click={() => dispatch('ITEM_CLICKED', { id })}
            key={id}
          >
            {id}
          </li>
        ))}
      </ul>
    );
  }
});
```

### Pattern 2: Child → Parent via Dispatched Actions

Dispatched actions bubble up automatically. The parent can listen using `actionHandlers` or DOM event listeners:

```javascript
// Child dispatches
dispatch('ITEM_SELECTED', { id: '123' });

// Parent handles it (since it bubbles)
createCustomElement('x-143767-parent', {
  actionHandlers: {
    'ITEM_SELECTED': (effect, { action, updateState }) => {
      const { id } = action.payload;
      updateState({ activeId: id });
    }
  }
});
```

---

## 9. Lifecycle Hooks

### `onConnect` — Component Added to DOM

Runs once when the component is first inserted into the page. Use it to:
- Start timers or subscriptions
- Fetch initial data
- Set up external event listeners

```javascript
createCustomElement('x-143767-timer', {
  // ...
  initialState: { elapsed: 0 },

  onConnect: (host) => {
    // host is the actual DOM element
    const timer = setInterval(() => {
      host.dispatchAction('TICK');
    }, 1000);

    // Store on host so onDisconnect can clean up
    host._timer = timer;
  },

  onDisconnect: (host) => {
    clearInterval(host._timer);
  },

  actionHandlers: {
    'TICK': (effect, { updateState, state }) => {
      updateState({ elapsed: state.elapsed + 1 });
    }
  }
});
```

### `onDisconnect` — Component Removed from DOM

Clean up anything started in `onConnect` to prevent memory leaks.

### `setInitialState` — Dynamic Initial State

Use instead of `initialState` when the starting state depends on properties:

```javascript
createCustomElement('x-143767-list', {
  properties: {
    defaultFilter: { default: 'all' }
  },

  setInitialState: (properties) => ({
    filter: properties.defaultFilter,   // Initialized from property
    items: []
  })
});
```

---

## 10. Async Operations and Side Effects

### Basic API Call Pattern

```javascript
createCustomElement('x-143767-incidents', {
  initialState: {
    incidents: [],
    isLoading: false,
    error: null
  },

  actionHandlers: {
    'LOAD_INCIDENTS': (effect, { updateState }) => {
      updateState({ isLoading: true, error: null });

      fetch('/api/now/table/incident?sysparm_limit=10', {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      })
        .then(r => r.json())
        .then(data => {
          updateState({
            incidents: data.result,
            isLoading: false
          });
        })
        .catch(err => {
          updateState({
            error: 'Failed to load incidents: ' + err.message,
            isLoading: false
          });
        });
    }
  },

  onConnect: (host) => {
    host.dispatchAction('LOAD_INCIDENTS');
  },

  view: (state) => {
    const { incidents, isLoading, error } = state;

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
      <ul>
        {incidents.map(inc => (
          <li key={inc.sys_id}>{inc.short_description}</li>
        ))}
      </ul>
    );
  }
});
```

### Using the ServiceNow SDK (Preferred in Platform)

Inside ServiceNow, use the `@servicenow/sdk` client instead of raw `fetch` for proper auth and context:

```javascript
import { createHttpClient } from '@servicenow/sdk/core';

createCustomElement('x-143767-incidents', {
  actionHandlers: {
    'LOAD_INCIDENTS': (effect, { updateState }) => {
      const client = createHttpClient();

      client.get('/api/now/table/incident', {
        params: { sysparm_limit: 10 }
      })
        .then(({ result }) => {
          updateState({ incidents: result });
        });
    }
  }
});
```

---

## 11. Building a Complete Application

Here's how to think about structuring a multi-component application:

### Structure Your Components in Layers

```
Page-level component (orchestrator)
├── Header component      (display, few interactions)
├── Filter bar component  (dispatches FILTER_CHANGED)
├── Item list component   (displays items, dispatches ITEM_SELECTED)
│   └── Item card (repeated, dispatches events up)
└── Detail panel component (shows selected item)
```

### Example: Task Manager Application

**1. The root component (`x-143767-task-app`) owns all state:**

```javascript
createCustomElement('x-143767-task-app', {
  initialState: {
    tasks: [],
    filter: 'all',        // 'all' | 'active' | 'done'
    activeTaskId: null,
    isLoading: false
  },

  actionHandlers: {
    'TASK_CREATED': (effect, { updateState, state }) => {
      updateState({
        tasks: [...state.tasks, {
          id: Date.now(),
          text: state.tasks.newText,
          done: false
        }]
      });
    },

    'TASK_TOGGLED': (effect, { action, updateState, state }) => {
      updateState({
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, done: !t.done } : t
        )
      });
    },

    'FILTER_CHANGED': (effect, { action, updateState }) => {
      updateState({ filter: action.payload.filter });
    }
  },

  view: (state, { dispatch }) => {
    const { tasks, filter, isLoading } = state;

    const visibleTasks = tasks.filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'done') return t.done;
      return true;
    });

    return (
      <div className="task-app">
        <x-143767-task-form></x-143767-task-form>
        <x-143767-filter-bar current-filter={filter}></x-143767-filter-bar>
        <x-143767-task-list tasks={visibleTasks}></x-143767-task-list>
      </div>
    );
  }
});
```

**2. Child components dispatch, parent handles:**

```javascript
// x-143767-task-form just dispatches — no state of its own
createCustomElement('x-143767-task-form', {
  initialState: { text: '' },

  view: (state, { updateState, dispatch }) => (
    <div>
      <input
        value={state.text}
        on-input={(e) => updateState({ text: e.target.value })}
        on-keypress={(e) => {
          if (e.key === 'Enter' && state.text.trim()) {
            dispatch('TASK_CREATED', { text: state.text });
            updateState({ text: '' });
          }
        }}
        placeholder="Add a task..."
      />
    </div>
  )
});
```

**3. Filter bar:**

```javascript
createCustomElement('x-143767-filter-bar', {
  properties: {
    currentFilter: { default: 'all' }
  },

  view: (state, { properties, dispatch }) => {
    const filters = ['all', 'active', 'done'];
    return (
      <div className="filter-bar">
        {filters.map(f => (
          <button
            className={f === properties.currentFilter ? 'active' : ''}
            on-click={() => dispatch('FILTER_CHANGED', { filter: f })}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
    );
  }
});
```

### Key Rule: Where Does State Live?

Put state in the **highest component that needs it**. If only one component uses a piece of state, keep it local. If multiple components need to share data, lift it to their common parent.

```
Parent owns: tasks[], filter         ← shared across children
Child owns:  inputText (form draft)  ← only the form cares about this
```

---

## 12. Deploying to ServiceNow and UI Builder

### The Deployment Model

When you run `npm run deploy`, the CLI:

1. Compiles your components (JS + SCSS → bundles)
2. Creates a **Scope** in ServiceNow (`x_143767_learning`)
3. Creates records in:
   - `sys_ux_lib_component` — the component definition
   - `sys_ux_macroponent` — how UI Builder references it
   - `sys_uib_toolbox_component` — the toolbox entry
   - `sys_ux_lib_asset` — the compiled JS/CSS files

### How UI Builder Uses Your Components

In UI Builder, your component appears in the **toolbox panel** under the label you set in `now-ui.json`. When dragged onto a page:

- **Properties** you defined become configurable in the right-hand panel
- **No controller needed** for components with self-contained state
- **A controller is needed** when you want to bind properties to ServiceNow data (table records, user info, etc.)

### Connecting a Component to Real Data (When to Use a Controller)

```
Self-contained component   → No controller (internal state only)
Component reads a SN table → Use a "Data Resource" controller
Component shows page data  → Use a declarative binding in UI Builder
```

### now-ui.json: Controlling How UI Builder Shows Your Component

```json
{
  "scopeName": "x_143767_learning",
  "components": {
    "x-143767-task-list": {
      "innerComponents": [],
      "uiBuilder": {
        "associatedTypes": ["global.core"],
        "label": "Task List",
        "icon": "list-outline",
        "description": "A task management component",
        "properties": [
          {
            "name": "title",
            "label": "Title",
            "description": "The heading text",
            "fieldType": "string"
          }
        ]
      }
    }
  }
}
```

---

## 13. Mental Model Summary

### The 5-Sentence Version

1. A component is a custom HTML element with its own **state** (a JS object).
2. The **view function** reads state and returns HTML; it runs every time state changes.
3. User interactions call `updateState()` for simple changes, or `dispatch()` for complex/async logic.
4. **Action handlers** receive dispatched actions and can call APIs, then call `updateState()` when done.
5. **Properties** are external inputs set by a parent or UI Builder; **state** is internal memory.

### Quick Decision Guide

| Situation | Use |
|-----------|-----|
| Simple button click updates a counter | `updateState()` directly in view |
| Fetch data from a REST API | `dispatch()` → action handler with `fetch()` |
| Pass data from parent to child | Property on child component |
| Child notifies parent of an event | `dispatch()` from child (bubbles up) |
| Shared data across multiple components | State in common parent, passed as properties |
| Something to run when component loads | `onConnect` lifecycle hook |
| UI that only displays, no logic | `createPresentationalCustomElement` |

### Common Gotchas

| Symptom | Cause | Fix |
|---------|-------|-----|
| State change not re-rendering | Mutating state directly (`state.x = y`) | Always use `updateState()` |
| Array update not working | `updateState({ items: state.items })` (same reference) | Use spread: `[...items, newItem]` |
| Event not firing | Used `onClick` (React style) | Use `on-click` (Snabbdom style) |
| Component not in UI Builder | Missing `uiBuilder` in `now-ui.json` | Add `uiBuilder` config, redeploy |
| Changes not showing after deploy | Browser cache | Hard refresh: Cmd+Shift+R |
| Child events not reaching parent | `stopPropagation` in dispatch | Remove or set to `false` |

---

## Quick Reference Card

```javascript
// Minimal working component
import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, { updateState, dispatch, properties }) => (
  <div>
    {/* Read state */}
    <p>{state.message}</p>

    {/* Update state directly */}
    <button on-click={() => updateState({ count: state.count + 1 })}>
      +
    </button>

    {/* Dispatch action for complex logic */}
    <button on-click={() => dispatch('SAVE_CLICKED', { id: 1 })}>
      Save
    </button>

    {/* Read property from parent */}
    <p>{properties.title}</p>
  </div>
);

createCustomElement('x-143767-my-component', {
  renderer: { type: snabbdom },
  view,
  styles,
  initialState: { message: 'Hello!', count: 0 },
  properties: {
    title: { default: 'My Component' }
  },
  actions: {
    SAVE_CLICKED: {}
  },
  actionHandlers: {
    'SAVE_CLICKED': (effect, { action, updateState }) => {
      const { id } = action.payload;
      updateState({ isSaving: true });
      // ... fetch, then updateState({ isSaving: false })
    }
  },
  onConnect: (host) => { /* setup */ },
  onDisconnect: (host) => { /* cleanup */ }
});
```

---

## Further Exploration

- **Existing components in this project:**
  - `src/x-143767-hello-world/` — minimal working example
  - `src/x-143767-hello-wazzup/` — state management basics
  - `src/x-143767-fluent-poc/` — full task manager with arrays and filtering

- **ServiceNow developer docs:**
  - Now Experience Framework: https://developer.servicenow.com/dev.do#!/guides/now-experience/ui-framework/introduction
  - UI Builder: https://developer.servicenow.com/dev.do#!/guides/ui-builder

- **Related guides in this project:**
  - `servicenow-ui-component-setup.md` — CLI configuration and deployment
