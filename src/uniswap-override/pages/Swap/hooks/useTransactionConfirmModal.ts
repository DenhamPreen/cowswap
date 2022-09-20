import { useUpdateAtom } from 'jotai/utils'
import { transactionConfirmAtom, TransactionConfirmState } from 'pages/Swap/state/transactionConfirmAtom'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from '@uni_src/state/application/reducer'
import { useCallback } from 'react'

export function useTransactionConfirmModal() {
  const setTransactionConfirm = useUpdateAtom(transactionConfirmAtom)
  const openTxConfirmationModal = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)

  return useCallback(
    (state: TransactionConfirmState) => {
      setTransactionConfirm(state)
      openTxConfirmationModal()
    },
    [setTransactionConfirm, openTxConfirmationModal]
  )
}
