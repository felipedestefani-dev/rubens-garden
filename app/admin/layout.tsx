export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // O middleware já protege as rotas /admin (exceto /admin/login)
  // Não precisamos verificar autenticação aqui para evitar loop de redirecionamento
  return <>{children}</>
}

