import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store/store";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import "./index.css";
// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <Toaster
            richColors
            position="top-right"
            offset={65}
            style={{ zIndex: 1500 }}
          />
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
}
