import styled from 'styled-components/macro'
import { loadingOpacityMixin } from 'components/Loader/styled'
import Input from 'components/NumericalInput'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.currencyInput!.background};
  border: ${({ theme }) => theme.currencyInput!.border};
  border-radius: 20px;

  padding: 1rem;
`

export const CurrencyInputBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  > :last-child {
    text-align: right;
  }
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  width: 100%;
  background: none;

  ${loadingOpacityMixin}
`

export const BalanceText = styled.span`
  font-weight: 400;
  font-size: 14px;
`
