import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { requestErrorMessage, type ApodRequestError } from '@/lib/client'

type RequestErrorProps = {
  error: ApodRequestError
  onRetry?: () => void
  extra?: ReactNode
}

export function RequestError({ error, onRetry, extra }: RequestErrorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-serif text-lg text-foreground" role="alert">
        {requestErrorMessage(error)}
      </p>
      {onRetry || extra ? (
        <div className="flex gap-2">
          {onRetry ? (
            <Button type="button" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
          {extra}
        </div>
      ) : null}
    </div>
  )
}
