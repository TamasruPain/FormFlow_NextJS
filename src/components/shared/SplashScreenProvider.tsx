"use client";

import React, { useState, useEffect } from "react";
import { SplashScreen } from "./SplashScreen";

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const start = Date.now();
    
    // Enforced page-loading state promises to measure actual API or initialization loading times
    const initialTasks = [
      new Promise((resolve) => {
        // Custom boot task
        resolve(true);
      }),
    ];

    Promise.all(initialTasks)
      .then(() => {
        const elapsed = Date.now() - start;
        const minDelay = 2000; // Enforce minimum 2-second timeout delay
        const remaining = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setFadeSplash(true);
          // Wait for fade-out transition to finish (500ms) before unmounting
          const fadeTimer = setTimeout(() => {
            setShowSplash(false);
          }, 500);
          return () => clearTimeout(fadeTimer);
        }, remaining);
      })
      .catch(() => {
        setShowSplash(false);
      });
  }, []);

  return (
    <>
      {showSplash && <SplashScreen isFadingOut={fadeSplash} />}
      <div
        className={`flex-1 flex flex-col min-h-screen ${
          showSplash ? "opacity-0" : "opacity-100 transition-opacity duration-700 ease-out"
        }`}
      >
        {children}
      </div>
    </>
  );
}
