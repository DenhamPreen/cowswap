import { Token } from '@uniswap/sdk-core'
import { WrapType } from '@src/hooks/useWrapCallback'
import { ReactNode } from 'react'
import { QuoteError } from 'state/price/actions'
import { ApprovalState } from '@src/hooks/useApproveCallback'
import TradeGp from 'state/swap/TradeGp'

export enum SwapButtonState {
  SwapIsUnsupported = 'SwapIsUnsupported',
  WalletIsUnsupported = 'WalletIsUnsupported',
  WrapError = 'WrapError',
  ShouldWrapNativeToken = 'ShouldWrapNativeToken',
  ShouldUnwrapNativeToken = 'ShouldUnwrapNativeToken',
  FeesExceedFromAmount = 'FeesExceedFromAmount',
  InsufficientLiquidity = 'InsufficientLiquidity',
  ZeroPrice = 'ZeroPrice',
  TransferToSmartContract = 'TransferToSmartContract',
  FetchQuoteError = 'FetchQuoteError',
  OfflineBrowser = 'OfflineBrowser',
  Loading = 'Loading',
  WalletIsNotConnected = 'WalletIsNotConnected',
  ReadonlyGnosisSafeUser = 'ReadonlyGnosisSafeUser',
  NeedApprove = 'NeedApprove',
  SwapDisabled = 'SwapDisabled',
  SwapError = 'SwapError',
  ExpertModeSwap = 'ExpertModeSwap',
  RegularSwap = 'RegularSwap',
  SwapWithWrappedToken = 'SwapWithWrappedToken',
  WrapAndSwap = 'WrapAndSwap',
}

export interface SwapButtonStateInput {
  account: string | undefined
  isSupportedWallet: boolean
  isReadonlyGnosisSafeUser: boolean
  isExpertMode: boolean
  isSwapSupported: boolean
  wrapType: WrapType
  wrapInputError: string | undefined
  quoteError: QuoteError | undefined | null
  inputError?: ReactNode
  approvalState: ApprovalState
  approvalSubmitted: boolean
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  isGettingNewQuote: boolean
  swapCallbackError: string | null
  trade: TradeGp | undefined | null
  isNativeIn: boolean
  wrappedToken: Token
}

const quoteErrorToSwapButtonState: { [key in QuoteError]: SwapButtonState | null } = {
  'fee-exceeds-sell-amount': SwapButtonState.FeesExceedFromAmount,
  'insufficient-liquidity': SwapButtonState.InsufficientLiquidity,
  'zero-price': SwapButtonState.ZeroPrice,
  'transfer-eth-to-smart-contract': SwapButtonState.TransferToSmartContract,
  'fetch-quote-error': SwapButtonState.FetchQuoteError,
  'offline-browser': SwapButtonState.OfflineBrowser,
  'unsupported-token': null,
}

export function getSwapButtonState(input: SwapButtonStateInput): SwapButtonState {
  const { wrapType, quoteError, approvalState } = input

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !input.inputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (input.approvalSubmitted && approvalState === ApprovalState.APPROVED))

  const isValid = !input.inputError && input.feeWarningAccepted && input.impactWarningAccepted
  const swapBlankState = !input.inputError && !input.trade

  if (input.isSwapSupported) {
    return SwapButtonState.SwapIsUnsupported
  }

  if (!input.isSupportedWallet) {
    return SwapButtonState.WalletIsUnsupported
  }

  if (wrapType !== WrapType.NOT_APPLICABLE && input.wrapInputError) {
    return SwapButtonState.WrapError
  }

  if (wrapType === WrapType.WRAP) {
    return SwapButtonState.ShouldWrapNativeToken
  }

  if (wrapType === WrapType.UNWRAP) {
    return SwapButtonState.ShouldUnwrapNativeToken
  }

  if (quoteError) {
    const quoteErrorState = quoteErrorToSwapButtonState[quoteError]

    if (quoteErrorState) return quoteErrorState
  }

  if (swapBlankState || input.isGettingNewQuote) {
    return SwapButtonState.Loading
  }

  if (!input.account) {
    return SwapButtonState.WalletIsNotConnected
  }

  if (input.isReadonlyGnosisSafeUser) {
    return SwapButtonState.ReadonlyGnosisSafeUser
  }

  if (!input.isNativeIn && showApproveFlow) {
    return SwapButtonState.NeedApprove
  }

  if (input.inputError) {
    return SwapButtonState.SwapError
  }

  if (!isValid || !!input.swapCallbackError) {
    return SwapButtonState.SwapDisabled
  }

  if (input.isNativeIn) {
    if (input.wrappedToken.symbol) {
      return SwapButtonState.SwapWithWrappedToken
    }

    return SwapButtonState.WrapAndSwap
  }

  if (input.isExpertMode) {
    return SwapButtonState.ExpertModeSwap
  }

  return SwapButtonState.RegularSwap
}
