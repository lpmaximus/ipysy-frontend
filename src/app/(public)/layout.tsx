/**
 * Layout da área pública (ipysy.com).
 *
 * Engloba todas as rotas acessíveis sem autenticação:
 * homepage, detalhes de eventos, rankings, etc. (B1+)
 *
 * TODO B1: adicionar Header público e Footer aqui.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
