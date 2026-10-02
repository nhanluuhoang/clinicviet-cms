import { ErrorSignInButton } from './sign-in-button'

export function ForbiddenError() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>Không có quyền truy cập</span>
        <p className='text-center text-muted-foreground'>
          Bạn không có quyền phù hợp <br /> để xem nội dung này.
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
