import * as styledEl from './styled'
import { Field } from 'state/swap/actions'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '../../state/limitOrdersAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { RateInput } from '../RateInput'
import { DeadlineInput } from '../DeadlineInput'
import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { TradeButtons } from '@cow/modules/limitOrders/containers/TradeButtons'
import { TradeApproveWidget } from '@cow/common/containers/TradeApprove/TradeApproveWidget'
import { useSetupTradeState } from '@cow/modules/trade'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { ImportTokenModal } from '@cow/modules/trade/containers/ImportTokenModal'
import { useOnImportDismiss } from '@cow/modules/trade/hooks/useOnImportDismiss'
import { limitRateAtom } from '../../state/limitRateAtom'
import { useDisableNativeTokenSelling } from '@cow/modules/limitOrders/hooks/useDisableNativeTokenSelling'
import { UnlockLimitOrders } from '../../pure/UnlockLimitOrders'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersPriceImpactParams } from '@cow/modules/limitOrders/hooks/useLimitOrdersPriceImpactParams'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cow/modules/wallet'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useOnCurrencySelection } from '@cow/modules/limitOrders/hooks/useOnCurrencySelection'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { useSetupLimitOrderAmountsFromUrl } from '@cow/modules/limitOrders/hooks/useSetupLimitOrderAmountsFromUrl'
import { formatInputAmount } from '@cow/utils/amountFormat'
import { InfoBanner } from '@cow/modules/limitOrders/pure/InfoBanner'
import { partiallyFillableOverrideAtom } from '@cow/modules/limitOrders/state/partiallyFillableOverride'
import { useAtom } from 'jotai'
import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'
import { TradeWidget } from '@cow/modules/trade/containers/TradeWidget'
import usePriceImpact from '@src/hooks/usePriceImpact'
import { useRateInfoParams } from '@cow/common/hooks/useRateInfoParams'

export function LimitOrdersWidget() {
  useSetupTradeState()
  useSetupLimitOrderAmountsFromUrl()
  useDisableNativeTokenSelling()

  const { chainId } = useWalletInfo()
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
    isUnlocked,
    orderKind,
  } = useLimitOrdersTradeState()
  const onCurrencySelection = useOnCurrencySelection()
  const onImportDismiss = useOnImportDismiss()
  const limitOrdersNavigate = useTradeNavigate()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const isSellOrder = useIsSellOrder()
  const tradeContext = useTradeFlowContext()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { isLoading: isRateLoading, activeRate, feeAmount } = useAtomValue(limitRateAtom)
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()

  const showRecipient = useMemo(
    () => !isWrapOrUnwrap && settingsState.showRecipient,
    [settingsState.showRecipient, isWrapOrUnwrap]
  )

  const isExpertMode = useMemo(
    () => !isWrapOrUnwrap && settingsState.expertMode,
    [isWrapOrUnwrap, settingsState.expertMode]
  )

  const priceImpact = usePriceImpact(useLimitOrdersPriceImpactParams())
  const inputViewAmount = formatInputAmount(inputCurrencyAmount, inputCurrencyBalance, orderKind === OrderKind.SELL)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputViewAmount,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You receive at least' : 'You receive exactly',
    currency: outputCurrency,
    rawAmount: isWrapOrUnwrap ? inputCurrencyAmount : outputCurrencyAmount,
    viewAmount: isWrapOrUnwrap
      ? inputViewAmount
      : formatInputAmount(outputCurrencyAmount, outputCurrencyBalance, orderKind === OrderKind.BUY),
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      updateCurrencyAmount({
        activeRate,
        amount: value,
        orderKind: isWrapOrUnwrap || field === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
      })
    },
    [updateCurrencyAmount, isWrapOrUnwrap, inputCurrency, outputCurrency, activeRate]
  )

  const onSwitchTokens = useCallback(() => {
    const { inputCurrencyId, outputCurrencyId } = state

    if (!isWrapOrUnwrap) {
      updateLimitOrdersState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
        orderKind: orderKind === OrderKind.SELL ? OrderKind.BUY : OrderKind.SELL,
      })
    }
    limitOrdersNavigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
  }, [
    state,
    isWrapOrUnwrap,
    limitOrdersNavigate,
    updateLimitOrdersState,
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
  ])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    chainId,
    onChangeRecipient,
    onUserInput,
    onSwitchTokens,
    onCurrencySelection,
    onImportDismiss,
    partiallyFillableOverride,
    featurePartialFillsEnabled: partialFillsEnabled,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
  }

  /**
   * Reset recipient value only once at App start
   */
  useEffect(() => {
    onChangeRecipient(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LimitOrders {...props} />
}

const LimitOrders = React.memo((props: LimitOrdersProps) => {
  const {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    chainId,
    isRateLoading,
    onUserInput,
    onSwitchTokens,
    onCurrencySelection,
    onImportDismiss,
    partiallyFillableOverride,
    featurePartialFillsEnabled,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    onChangeRecipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
  } = props

  const inputCurrency = inputCurrencyInfo.currency
  const outputCurrency = outputCurrencyInfo.currency

  const isTradePriceUpdating = useMemo(() => {
    if (isWrapOrUnwrap || !inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, isWrapOrUnwrap, inputCurrency, outputCurrency])

  const isPartiallyFillable = featurePartialFillsEnabled && settingsState.partialFillsEnabled

  const [showConfirmation, setShowConfirmation] = useState(false)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  const slots = {
    settingsWidget: <SettingsWidget />,
    lockScreen: isUnlocked ? undefined : (
      <UnlockLimitOrders handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })} />
    ),
    middleContent: (
      <styledEl.RateWrapper>
        <RateInput />
        <DeadlineInput />
      </styledEl.RateWrapper>
    ),
    bottomContent: (
      <>
        {!isWrapOrUnwrap && (
          <styledEl.FooterBox>
            <styledEl.StyledRateInfo rateInfoParams={rateInfoParams} />
          </styledEl.FooterBox>
        )}

        {isExpertMode && (
          <styledEl.FooterBox>
            <styledEl.StyledOrderType
              isPartiallyFillable={isPartiallyFillable}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={featurePartialFillsEnabled}
            />
          </styledEl.FooterBox>
        )}

        {!isWrapOrUnwrap && <LimitOrdersWarnings priceImpact={priceImpact} feeAmount={feeAmount} />}

        <styledEl.TradeButtonBox>
          <TradeButtons
            inputCurrencyAmount={inputCurrencyInfo.rawAmount}
            tradeContext={tradeContext}
            priceImpact={priceImpact}
            openConfirmScreen={() => setShowConfirmation(true)}
          />
        </styledEl.TradeButtonBox>
      </>
    ),
  }

  const actions = {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onSwitchTokens,
  }

  const params = {
    compactView: false,
    recipient,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    isRateLoading,
  }

  return (
    <>
      <TradeWidget
        slots={slots}
        actions={actions}
        params={params}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
      />
      <TradeApproveWidget />
      {tradeContext && (
        <LimitOrdersConfirmModal
          isOpen={showConfirmation}
          tradeContext={tradeContext}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={onImportDismiss} />}
      {isUnlocked && <InfoBanner />}
    </>
  )
}, limitOrdersPropsChecker)
