import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-4">
          <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
          <div className="relative text-center">
            <p className="text-[120px] font-bold leading-none tracking-tighter text-gradient-brand sm:text-[160px]">
              404
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Page Not Found
            </h1>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div className="mt-8">
              <a
                href="/"
                className="btn-primary inline-flex h-11 items-center justify-center px-8 text-sm font-medium"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
