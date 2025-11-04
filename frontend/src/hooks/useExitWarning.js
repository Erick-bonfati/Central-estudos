import { useEffect, useRef } from "react";
import { useBeforeUnload, useLocation } from "react-router-dom";

export function useExitWarning(shouldWarn) {
  const location = useLocation();
  const stayUrlRef = useRef(window.location.href);

  useBeforeUnload(
    (event) => {
      if (shouldWarn) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    shouldWarn
  );

  useEffect(() => {
    stayUrlRef.current = window.location.href;
  }, [location]);

  useEffect(() => {
    if (!shouldWarn) return undefined;

    const message = "O timer está em execução. Deseja sair desta página?";
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    const confirmExit = () => window.confirm(message);

    const cleanup = () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", handlePopState);
    };

    function handlePopState() {
      if (confirmExit()) {
        cleanup();
      } else {
        originalPush.call(window.history, window.history.state, document.title, stayUrlRef.current);
        stayUrlRef.current = window.location.href;
      }
    }

    window.history.pushState = function pushState(...args) {
      if (confirmExit()) {
        cleanup();
        return originalPush.apply(window.history, args);
      }
      return undefined;
    };

    window.history.replaceState = function replaceState(...args) {
      if (confirmExit()) {
        cleanup();
        return originalReplace.apply(window.history, args);
      }
      return undefined;
    };

    window.addEventListener("popstate", handlePopState);

    return cleanup;
  }, [shouldWarn, location]);
}

