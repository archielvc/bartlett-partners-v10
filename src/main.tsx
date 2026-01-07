import { createRoot, hydrateRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { queryClient } from './lib/queryClient';
import App from "./App.tsx";
import "./index.css";

// Initialize Vercel Speed Insights
injectSpeedInsights();

const container = document.getElementById("root")!;

const AppWithProviders = (
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);

// Support react-snap pre-rendering: hydrate if pre-rendered, otherwise render
if (container.hasChildNodes()) {
  hydrateRoot(container, AppWithProviders);
} else {
  createRoot(container).render(AppWithProviders);
}
