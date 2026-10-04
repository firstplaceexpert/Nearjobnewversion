import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import manifest from "@/app/manifest";
import { PwaProvider, PwaInstallCard } from "@/components/pwa";

describe("PWA Configuration & Manifest", () => {
  it("returns a valid web app manifest with standalone display and required icons", () => {
    const config = manifest();

    expect(config.name).toContain("NEAR JOB");
    expect(config.short_name).toBe("NearJob");
    expect(config.start_url).toBe("/");
    expect(config.display).toBe("standalone");
    expect(config.theme_color).toBe("#1867F8");
    expect(config.background_color).toBe("#ffffff");

    // Must have standard icons
    expect(config.icons).toBeDefined();
    expect(config.icons?.length).toBeGreaterThanOrEqual(2);

    const has192 = config.icons?.some((i) => i.sizes === "192x192");
    const has512 = config.icons?.some((i) => i.sizes === "512x512");
    const hasMaskable = config.icons?.some((i) => i.purpose === "maskable");

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });
});

describe("PWA Components", () => {
  it("renders PwaInstallCard within PwaProvider without crashing", () => {
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <PwaProvider>
        <PwaInstallCard />
      </PwaProvider>,
    );

    expect(screen.getByText("Pakai NearJob Sebagai Aplikasi")).toBeInTheDocument();
    expect(screen.getByText(/Bisa dipasang di HP/)).toBeInTheDocument();
  });
});
