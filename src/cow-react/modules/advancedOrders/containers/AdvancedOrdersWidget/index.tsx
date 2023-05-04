import { useSetupTradeState } from '@cow/modules/trade'
import { TradeWidget, TradeWidgetSlots } from '@cow/modules/trade/containers/TradeWidget'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from '@src/state/swap/actions'
import {
  useAdvancedOrdersFullState,
  useFillAdvancedOrdersFullState,
} from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersFullState'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useNavigateOnCurrencySelection } from '@cow/modules/trade/hooks/useNavigateOnCurrencySelection'
import { DeadlineInput } from '../DeadlineInput'

export function AdvancedOrdersWidget() {
  useSetupTradeState()
  useFillAdvancedOrdersFullState()

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
    orderKind,
  } = useAdvancedOrdersFullState()
  const onCurrencySelection = useNavigateOnCurrencySelection()

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    receiveAmountInfo: null,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: orderKind === OrderKind.BUY,
    receiveAmountInfo: null,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
  }

  // TODO
  const slots: TradeWidgetSlots = {
    settingsWidget: <div></div>,
    bottomContent: (
      <>
        <DeadlineInput />
      </>
    ),
  }

  // TODO
  const actions = {
    onCurrencySelection,
    onUserInput() {
      console.log('onUserInput')
    },
    onChangeRecipient() {
      console.log('onChangeRecipient')
    },
    onSwitchTokens() {
      console.log('onSwitchTokens')
    },
  }

  const params = {
    recipient,
    compactView: false,
    showRecipient: false,
    isTradePriceUpdating: false,
    priceImpact: {
      priceImpact: undefined,
      error: undefined,
      loading: false,
    },
  }

  return (
    <TradeWidget
      id="advanced-orders-page"
      slots={slots}
      actions={actions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
    />
  )
}
