// Add this at the very top of your index.js
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('[HMR]')) {
      return;
    }
    originalError(...args);
  };
}