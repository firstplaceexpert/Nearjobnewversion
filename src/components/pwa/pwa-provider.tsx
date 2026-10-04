"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  hasDeferredPrompt: boolean;
  promptInstall: () => Promise<void>;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    mql.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getStandaloneServerSnapshot() {
  return false;
}

function subscribeIos() {
  return () => {};
}

function getIosSnapshot() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: true,
  isInstalled: false,
  isIos: false,
  hasDeferredPrompt: false,
  promptInstall: async () => {},
  showInstallModal: false,
  setShowInstallModal: () => {},
  showIosGuide: false,
  setShowIosGuide: () => {},
});

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  );

  const isIos = useSyncExternalStore(
    subscribeIos,
    getIosSnapshot,
    getStandaloneServerSnapshot,
  );

  const isInstalled = isStandalone || justInstalled;

  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update();
          if (reg.installing) {
            console.log("[PWA] Service worker installing");
          } else if (reg.active) {
            console.log("[PWA] Service worker active");
          }
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration failed:", err);
        });
    }

    // 2. Capture 'beforeinstallprompt' event for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setJustInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      console.log("[PWA] App successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    // If native prompt is available, trigger it directly!
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setJustInstalled(true);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.error("[PWA] Install prompt error:", err);
      }
    }

    // Fallback: Always open the interactive install modal with QR code & instructions
    setShowInstallModal(true);
  }, [deferredPrompt]);

  const isInstallable = !isInstalled;
  const hasDeferredPrompt = Boolean(deferredPrompt);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        hasDeferredPrompt,
        promptInstall,
        showInstallModal,
        setShowInstallModal,
        showIosGuide,
        setShowIosGuide,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
