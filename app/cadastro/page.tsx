import RegisterForm from '@/components/RegisterForm'

export default function CadastroPage() {
  return (
    <div className="max-w-md mx-auto pt-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Criar conta</h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Você precisará de um código de convite para participar.
      </p>
      <RegisterForm />
    </div>
  )
}
