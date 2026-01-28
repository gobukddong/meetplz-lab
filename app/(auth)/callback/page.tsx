// OAuth 콜백 처리 페이지

export default function CallbackPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">로그인 처리 중…</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        OAuth 콜백을 처리하고 있어요. 자동으로 리다이렉트된다면 이 탭을 닫아도 됩니다.
      </p>
    </div>
  )
}
