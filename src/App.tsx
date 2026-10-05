import { BrowserRouter } from "react-router-dom";
import AppLayout from "./app/components/AppLayout";
import HouseholdProvider from "./features/household/components/HouseholdProvider";
import AppRoutes from "./app/AppRoutes";
import PreferencesProvider from "./shared/preferences/PreferencesProvider";
import ConfirmationProvider from "./shared/confirmation/ConfirmationProvider";

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <HouseholdProvider>
          <ConfirmationProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </ConfirmationProvider>
        </HouseholdProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
