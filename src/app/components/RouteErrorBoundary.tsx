import { Component, useId } from "react";
import type { ReactNode } from "react";
import { usePreferences } from "../../shared/preferences/PreferencesContext";

class CatchRouteError extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = usePreferences();
  const headingId = useId();

  return (
    <CatchRouteError
      fallback={
        <section
          role="alert"
          aria-labelledby={headingId}
          className="panel space-y-4"
        >
          <h1 id={headingId} className="text-xl font-bold">
            {t("Couldn't load this page.")}
          </h1>
          <p className="text-sm text-[color:var(--roomie-muted,#69608D)]">
            {t("Check your connection, then reload the page.")}
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            {t("Reload page")}
          </button>
        </section>
      }
    >
      {children}
    </CatchRouteError>
  );
}

export default RouteErrorBoundary;
