import SystemMonitor from "./containers/system/SystemMonitor.tsx";
import AppProvider from "./providers";

function App() {
  return (
    <AppProvider>
      <SystemMonitor />
    </AppProvider>
  );
}

export default App;
