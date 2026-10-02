import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

export function ErrorSignInButton() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const returnToSignIn = async () => {
    useAuthStore.getState().auth.reset()
    await queryClient.cancelQueries()
    queryClient.clear()
    await navigate({ to: '/sign-in', search: {}, replace: true })
  }

  return (
    <Button variant='outline' onClick={returnToSignIn}>
      Đăng nhập lại
    </Button>
  )
}
