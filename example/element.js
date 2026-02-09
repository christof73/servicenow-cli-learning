// Import all components for local development preview
import '../src/x-snc-learning-hello-world';
import '../src/x-snc-learning-hello-wazzup';

// Add components to the page for preview
window.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.backgroundColor = '#f5f5f5';
  container.style.minHeight = '100vh';

  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
      <h1 style="color: #293e40; border-bottom: 2px solid #293e40; padding-bottom: 10px;">Component Preview</h1>

      <h2 style="color: #293e40; margin-top: 30px;">Hello World Component</h2>
      <x-snc-learning-hello-world></x-snc-learning-hello-world>

      <h2 style="color: #293e40; margin-top: 30px;">Hello Wazzup Component</h2>
      <x-snc-learning-hello-wazzup></x-snc-learning-hello-wazzup>
    </div>
  `;

  document.body.appendChild(container);
});
