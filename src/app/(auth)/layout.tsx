/**
 * Route group layout for auth pages (login, register).
 * Centered layout with minimal chrome.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
