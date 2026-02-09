import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, { updateState }) => {
  const { greeting } = state;

  return (
    <div className="hello-world">
      <h1>{greeting}</h1>
      <button on-click={() => updateState({ greeting: 'Hello, ServiceNow!' })}>
        Click me
      </button>
    </div>
  );
};

createCustomElement('x-143767-hello-world', {
  renderer: { type: snabbdom },
  view,
  styles,
  initialState: {
    greeting: 'Hello, World!'
  }
});
