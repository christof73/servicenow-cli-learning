import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, { updateState }) => {
  const { tasks, newTaskText } = state;

  const addTask = () => {
    if (newTaskText.trim()) {
      updateState({
        tasks: [...tasks, { id: Date.now(), text: newTaskText, completed: false }],
        newTaskText: ''
      });
    }
  };

  const toggleTask = (taskId) => {
    updateState({
      tasks: tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    });
  };

  const deleteTask = (taskId) => {
    updateState({
      tasks: tasks.filter(task => task.id !== taskId)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="fluent-poc">
      <div className="fluent-header">
        <h2>Fluent Task Manager POC</h2>
        <p className="subtitle">A simple task list demonstrating modern ServiceNow UI patterns</p>
      </div>

      <div className="task-input-section">
        <input
          type="text"
          className="task-input"
          placeholder="Enter a new task..."
          value={newTaskText}
          on-input={(e) => updateState({ newTaskText: e.target.value })}
          on-keypress={handleKeyPress}
        />
        <button className="btn-primary" on-click={addTask}>
          Add Task
        </button>
      </div>

      <div className="task-stats">
        <span>Total: {tasks.length}</span>
        <span>Completed: {tasks.filter(t => t.completed).length}</span>
        <span>Pending: {tasks.filter(t => !t.completed).length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div className={`task-item ${task.completed ? 'completed' : ''}`} key={task.id}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                on-change={() => toggleTask(task.id)}
              />
              <span className="task-text">{task.text}</span>
              <button className="btn-delete" on-click={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="task-actions">
          <button
            className="btn-secondary"
            on-click={() => updateState({ tasks: [] })}
          >
            Clear All Tasks
          </button>
        </div>
      )}
    </div>
  );
};

createCustomElement('x-143767-fluent-poc', {
  renderer: { type: snabbdom },
  view,
  styles,
  initialState: {
    tasks: [],
    newTaskText: ''
  }
});
