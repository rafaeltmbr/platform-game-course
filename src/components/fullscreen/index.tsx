import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";

import "./styles.css";

export const Fullscreen: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );

  useEffect(() => {
    const listener = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", listener);

    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const handleRequest = useCallback(async () => {
    try {
      await document.body.requestFullscreen();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Request full screen error", msg);
    }
  }, []);

  const handleExit = useCallback(async () => {
    try {
      await document.exitFullscreen();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Exit full screen error", msg);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleExit);
    return document.removeEventListener("keydown", handleExit);
  }, [handleExit]);

  return (
    <div className="fullscreen">
      {isFullscreen ? (
        <div className="button" onClick={handleExit}>
          <AiOutlineFullscreenExit />
        </div>
      ) : (
        <div className="button" onClick={handleRequest}>
          <AiOutlineFullscreen />
        </div>
      )}
    </div>
  );
};
