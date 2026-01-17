import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import App from "./App";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep this empty: we render the error on screen.
    void error;
  }

  render() {
    if (this.state.hasError) {
      const msg =
        this.state.error instanceof Error
          ? `${this.state.error.name}: ${this.state.error.message}`
          : "Unknown error";
      return (
        <div style={{ padding: 24, color: "#fff", fontFamily: "ui-sans-serif, system-ui" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Dawnpage crashed</div>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>{msg}</pre>
          <div style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}>
            Open DevTools Console for full stack trace.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
