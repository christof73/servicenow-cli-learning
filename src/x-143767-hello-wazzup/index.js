import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, { updateState }) => {
  const { message, count } = state;

  return (
    <div className="hello-wazzup">
      <h1>{message}</h1>
      <p>You clicked {count} times</p>
      <button on-click={() => updateState({ count: count + 1 })}>
        Wazzup! Click me
      </button>
      <button on-click={() => updateState({ count: 0, message: 'Reset!' })}>
        Reset
      </button>
    </div>
  );
};

createCustomElement('x-143767-hello-wazzup', {
  renderer: { type: snabbdom },
  view,
  styles,
  initialState: {
    message: 'Wazzup, ServiceNow!',
    count: 0
  }
});
