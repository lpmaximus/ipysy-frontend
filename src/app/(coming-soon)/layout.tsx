/**
 * Layout isolado do Coming Soon.
 *
 * Temporário — será removido quando a aplicação entrar em produção.
 * Não compartilha nenhum elemento visual (header, footer, sidebar) com
 * os layouts público ou restrito. Qualquer alteração aqui é isolada.
 */
export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
