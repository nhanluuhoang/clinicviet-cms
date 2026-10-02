import { ErrorSignInButton } from './sign-in-button'

export function UnauthorisedError() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>Chưa đăng nhập</span>
        <p className='text-center text-muted-foreground'>
          Vui lòng đăng nhập bằng tài khoản phù hợp <br /> để truy cập nội dung
          này.
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
