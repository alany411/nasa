import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { requestErrorMessage, type ApodRequestError } from '@/lib/client'

const TOAST_ID = 'request-error'

export function useRequestErrorToast(error: ApodRequestError | null, onRetry: () => void) {
  const onRetryRef = useRef(onRetry)

  useEffect(() => {
    onRetryRef.current = onRetry
  }, [onRetry])

  useEffect(() => {
    return () => {
      toast.dismiss(TOAST_ID)
    }
  }, [])

  useEffect(() => {
    if (!error) {
      toast.dismiss(TOAST_ID)
      return
    }

    toast.error(requestErrorMessage(error), {
      id: TOAST_ID,
      duration: Infinity,
      action: {
        label: 'Retry',
        onClick: () => {
          onRetryRef.current()
        },
      },
    })
  }, [error])
}
