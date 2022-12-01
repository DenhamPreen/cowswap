import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { useOrders } from 'state/orders/hooks'
import { useCallback, useMemo } from 'react'
import { Order, OrderStatus } from 'state/orders/actions'
import { getOrderFilledAmount } from '@cow/modules/limitOrders/utils/getOrderFilledAmount'
import { getOrderSurplus } from '@cow/modules/limitOrders/utils/getOrderSurplus'
import { getOrderExecutedAmounts } from '@cow/modules/limitOrders/utils/getOrderExecutedAmounts'
import { isOrderFilled } from '@cow/modules/limitOrders/utils/isOrderFilled'

export interface LimitOrdersList {
  pending: ParsedOrder[]
  history: ParsedOrder[]
}

export interface ParsedOrder extends Order {
  executedBuyAmount?: JSBI
  executedSellAmount?: JSBI
  surplusFee?: string
  expirationTime?: Date
  partiallyFilled?: boolean
  fullyFilled?: boolean
  filledAmount?: BigNumber
  filledPercentage?: BigNumber
  surplusAmount?: BigNumber
  surplusPercentage?: BigNumber
  executedFeeAmount?: BigNumber
  parsedCreationtime?: Date
}

const pendingOrderStatuses: OrderStatus[] = [OrderStatus.PRESIGNATURE_PENDING, OrderStatus.PENDING]

export function useLimitOrdersList(): LimitOrdersList {
  const { chainId, account } = useWeb3React()
  const allNonEmptyOrders = useOrders({ chainId })
  const accountLowerCase = account?.toLowerCase()

  const ordersFilter = useCallback((order: Order) => order.owner.toLowerCase() === accountLowerCase, [accountLowerCase])
  const ordersSorter = (a: Order, b: Order) => Date.parse(b.creationTime) - Date.parse(a.creationTime)
  const ordersParser = (order: Order): ParsedOrder => {
    const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(order)
    const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(order)
    const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)
    const expirationTime = new Date(Number(order.validTo) * 1000)
    const executedFeeAmount = new BigNumber(order.apiAdditionalInfo?.executedFeeAmount || 0)
    const parsedCreationtime = new Date(order.creationTime)
    const fullyFilled = isOrderFilled(order)

    return {
      ...order,
      expirationTime,
      executedBuyAmount,
      executedSellAmount,
      filledAmount,
      filledPercentage,
      surplusAmount,
      surplusPercentage,
      executedFeeAmount,
      parsedCreationtime,
      fullyFilled,
    }
  }

  const allSortedOrders = useMemo(() => {
    return allNonEmptyOrders.filter(ordersFilter).map(ordersParser).sort(ordersSorter)
  }, [allNonEmptyOrders, ordersFilter])

  return useMemo(() => {
    return allSortedOrders.reduce(
      (acc, order) => {
        if (pendingOrderStatuses.includes(order.status)) {
          acc.pending.push(order)
        } else {
          acc.history.push(order)
        }

        return acc
      },
      { pending: [], history: [] } as LimitOrdersList
    )
  }, [allSortedOrders])
}