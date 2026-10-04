import { BrowserRouter } from "react-router-dom";
import AppLayout from "./app/components/AppLayout";
import HouseholdProvider from "./features/household/components/HouseholdProvider";
import AppRoutes from "./app/AppRoutes";
import PreferencesProvider from "./shared/preferences/PreferencesProvider";

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <HouseholdProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </HouseholdProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
