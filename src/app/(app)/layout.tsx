/**
 * Layout da área restrita (app.ipysy.com).
 *
 * Engloba todas as rotas autenticadas: dashboard, eventos, analytics,
 * perfil, configurações, etc. (B2+)
 *
 * TODO B0: adicionar AuthGuard (redirect para login se não autenticado).
 * TODO B2: adicionar Sidebar e TopBar da área autenticada aqui.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
