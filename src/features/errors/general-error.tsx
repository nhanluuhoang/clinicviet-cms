import { cn } from '@/lib/utils'
import { ErrorSignInButton } from './sign-in-button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>500</h1>
        )}
        <span className='font-medium'>Đã xảy ra lỗi {`:')`}</span>
        <p className='text-center text-muted-foreground'>
          Xin lỗi vì sự bất tiện này. <br /> Vui lòng thử lại sau.
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <ErrorSignInButton />
          </div>
        )}
      </div>
    </div>
  )
}
