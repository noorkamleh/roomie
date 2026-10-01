import { BrowserRouter } from "react-router-dom";
import AppLayout from "./app/components/AppLayout";
import HouseholdProvider from "./features/household/components/HouseholdProvider";
import AppRoutes from "./app/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <HouseholdProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </HouseholdProvider>
    </BrowserRouter>
  );
}

export default App;
