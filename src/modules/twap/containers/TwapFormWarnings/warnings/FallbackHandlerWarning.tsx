import styled from 'styled-components/macro'

import { InlineBanner } from 'common/pure/InlineBanner'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-weight: bold;
  text-align: left;
`

const WarningCheckboxWrapper = styled(CheckboxWrapper)`
  width: 100%;
  margin: 0 auto;
  border: 1px solid;
  border-radius: 16px;
  padding: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
`

const WarningCheckbox = styled.label`
  display: flex;
  gap: 10px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  width: 100%;

  > input {
    --size: 21px;
    width: var(--size);
    height: var(--size);
  }
`

const InlineBannerWithCheckbox = styled(InlineBanner)``

interface FallbackHandlerWarningProps {
  isFallbackHandlerSetupAccepted: boolean
  toggleFallbackHandlerSetupFlag(isChecked: boolean): void
}

export function FallbackHandlerWarning({
  isFallbackHandlerSetupAccepted,
  toggleFallbackHandlerSetupFlag,
}: FallbackHandlerWarningProps) {
  const fallbackHandlerCheckbox = (
    <WarningCheckbox>
      <input
        type="checkbox"
        checked={isFallbackHandlerSetupAccepted}
        onChange={(event) => toggleFallbackHandlerSetupFlag(event.currentTarget.checked)}
      />
      <span>Modify Safe's fallback handler when placing order</span>
    </WarningCheckbox>
  )

  if (isFallbackHandlerSetupAccepted) {
    return (
      <Wrapper>
        <InlineBanner hideIcon={true} type="information">
          <CheckboxWrapper>{fallbackHandlerCheckbox}</CheckboxWrapper>
        </InlineBanner>
      </Wrapper>
    )
  } else {
    return (
      <Wrapper>
        <InlineBannerWithCheckbox type="alert">
          <strong>Unsupported Safe detected</strong>
          <p>
            Connected Safe lacks required fallback handler. Switch to a compatible Safe or modify fallback handler for
            TWAP orders when placing your order.
          </p>
          {/*<HashLink to="/faq/limit-order#how-do-fees-work">Learn more</HashLink>*/}
          {/*TODO: set a proper link*/}
          <WarningCheckboxWrapper>{fallbackHandlerCheckbox}</WarningCheckboxWrapper>
        </InlineBannerWithCheckbox>
      </Wrapper>
    )
  }
}
