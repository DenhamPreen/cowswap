import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  padding: 0;
  margin: 0;
  min-height: 24px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
  font-size: 13px;
`

export const Label = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const Current = styled.button`
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: 0;
  outline: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  cursor: pointer;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  `}

  &:hover {
    text-decoration: underline;
  }

  > span {
    display: inline-block;
  }

  > svg {
    margin: 0 0 0 auto;
  }
`

export const ListWrapper = styled.ul`
  display: block;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  list-style: none;
`

export const ListItem = styled.button`
  color: ${({ theme }) => theme.text1};
  background: none;
  border: 0;
  outline: none;
  margin: 0 0 10px 0;
  padding: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  position: relative;

  :hover {
    text-decoration: underline;
  }
`

export const CustomInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  ::-webkit-calendar-picker-indicator {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`
