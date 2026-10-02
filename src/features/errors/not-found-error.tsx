import { ErrorSignInButton } from './sign-in-button'

export function NotFoundError() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>404</h1>
        <span className='font-medium'>Không tìm thấy trang</span>
        <p className='text-center text-muted-foreground'>
          Trang bạn đang tìm kiếm không tồn tại <br /> hoặc có thể đã bị xóa.
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
