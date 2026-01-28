"use client"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} meetplz. 모든 권리 보유.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              개인정보처리방침
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              이용약관
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              도움말
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
