import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import React, { useCallback, useState } from 'react'

import { ButtonPrimary } from 'legacy/components/Button'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'
import { LegacyConfirmationPendingContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationPendingContent'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'
import { isRejectRequestProviderError } from 'legacy/utils/misc'

import { useWalletInfo } from 'modules/wallet'

import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useCancelMultipleOrders } from 'common/hooks/useMultipleOrdersCancellation/useCancelMultipleOrders'
import { CowModal as Modal } from 'common/pure/Modal'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

interface Props {
  isOpen: boolean
  onDismiss: () => void
}

export function MultipleOrdersCancellationModal(props: Props) {
  const { isOpen, onDismiss } = props

  const { chainId } = useWalletInfo()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useUpdateAtom(updateOrdersToCancelAtom)
  const cancelAll = useCancelMultipleOrders()
  const cancelPendingOrder = useRequestOrderCancellation()
  const [cancellationInProgress, setCancellationInProgress] = useState(false)
  const [cancellationError, setCancellationError] = useState<Error | null>(null)

  const ordersCount = ordersToCancel.length || 0

  const dismissAll = useCallback(() => {
    setCancellationInProgress(false)
    onDismiss()
    setCancellationError(null)
  }, [onDismiss])

  const signAndSendCancellation = useCallback(async () => {
    if (!chainId) return

    // Show pending modal
    setCancellationInProgress(true)

    try {
      // Sign and send cancellation message
      await cancelAll(ordersToCancel)

      // Change orders state in store
      ordersToCancel.forEach((order) => {
        cancelPendingOrder({ chainId, id: order.id })
      })

      // Clean cancellation queue
      updateOrdersToCancel([])
      dismissAll()
    } catch (error: any) {
      setCancellationInProgress(false)
      setCancellationError(error)
    }
  }, [chainId, cancelPendingOrder, cancelAll, ordersToCancel, dismissAll, updateOrdersToCancel])

  if (!isOpen || !chainId) return null

  // TODO: use TradeConfirmModal
  if (cancellationError) {
    const errorMessage = isRejectRequestProviderError(cancellationError)
      ? 'User rejected signing'
      : cancellationError.message

    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <TransactionErrorContent onDismiss={dismissAll} message={errorMessage} />
      </Modal>
    )
  }

  if (cancellationInProgress) {
    return (
      <Modal isOpen={true} onDismiss={dismissAll}>
        <LegacyConfirmationPendingContent
          chainId={chainId}
          onDismiss={onDismiss}
          pendingText={<>Cancelling {ordersCount} orders</>}
          operationType={ConfirmOperationType.ORDER_CANCEL}
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <LegacyConfirmationModalContent
        title={`Cancel multiple orders: ${ordersCount}`}
        onDismiss={onDismiss}
        topContent={() => (
          <div>
            <p>Are you sure you want to cancel {ordersCount} orders?</p>
          </div>
        )}
        bottomContent={() => (
          <div>
            <ButtonPrimary onClick={signAndSendCancellation}>Request cancellations</ButtonPrimary>
          </div>
        )}
      />
    </Modal>
  )
}
