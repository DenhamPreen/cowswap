# CowSwap Widget

Integrate the power of `CowSwap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the
look and much more!

[![Demo](./demo-preview.png)](./widget-demo.mp4)

> [Watch the demo](./widget-demo.mp4)

## Install

```bash
yarn add @cowprotocol/widget-lib
```

```bash
npm install @cowprotocol/widget-lib
```

## Quick start

```typescript
import { cowSwapWidget, CowSwapWidgetParams, CowSwapWidgetSettings } from '@cowprotocol/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  container: widgetContainer,
  width: 600,
  height: 640,
}

const settings: CowSwapWidgetSettings = {
  urlParams: {
    sell: { asset: 'DAI' },
    buy: { asset: 'USDC', amount: '0.1' }
  }
}

cowSwapWidget(params, settings)
```

## Wallet provider

You can pass the wallet provider from your application to seamlessly use the widget as part of your application.
Also, you can not specify the provider, in this case the widget will work in standalone mode with the ability to connect any wallet supported in CowSwap.

A provider must comply with [EIP-1193](https://eips.ethereum.org/EIPS/eip-11930) and implement the interface:
```typescript
interface EthereumProvider {
  on(event: string, args: unknown): void
  request<T>(params: JsonRpcRequest): Promise<T>
  enable(): Promise<void>
}

interface JsonRpcRequest {
  id: number
  method: string
  params: unknown[]
}
```

An example of connecting a widget to Metamask:

```typescript
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

const params: CowSwapWidgetParams = {
  container: document.getElementById('cowswap-widget'),
  width: 600,
  height: 640,
  provider: window.ethereu // <-------
}

cowSwapWidget(params, {})
```

## Configuration

### `CowSwapWidgetParams`

| Parameter   | Type               | Description                                                                |
|-------------|--------------------|----------------------------------------------------------------------------|
| `width`     | `number`           | The width of the widget in pixels.                                         |
| `height`    | `number`           | The height of the widget in pixels.                                        |
| `container` | `HTMLElement`      | The container in which the widget will be displayed.                       |
| `provider`  | `EthereumProvider` | (Optional) The Ethereum provider to be used for interacting with a wallet. |

### `CowSwapWidgetSettings`

| Parameter   | Type                     | Description                                                                                                                     |
|-------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `urlParams` | `CowSwapWidgetUrlParams` | The URL parameters of the widget, including chain information, trade type, environment, assets, and theme.                      |
| `appParams` | `CowSwapWidgetAppParams` | (Optional) The application parameters of the widget, including the logo URL and flags for hiding the logo and network selector. |

### `CowSwapWidgetUrlParams`

| Parameter     | Type               | Description                                                                                            |
|---------------|--------------------|--------------------------------------------------------------------------------------------------------|
| `chainId`     | `number`           | The blockchain ID on which the trade will take place.                                                  |
| `tradeType`   | `string`           | The type of trade. Can be `swap` or `limit-orders`.                                                    |
| `env`         | `CowSwapWidgetEnv` | The environment of the widget (`'local'` or `'prod'`). |
| `theme`       | `CowSwapTheme`     | (Optional) The theme of the widget (`'dark'` for dark theme or `'light'` for light theme).             |
| `tradeAssets` | `TradeAssets`      | (Optional) An object containing information about the selling and buying assets.                       |

```typescript
interface TradeAsset {
  asset: string
  amount?: string
}

export interface TradeAssets {
  sell: TradeAsset
  buy: TradeAsset
}
```

### `CowSwapWidgetAppParams`

| Parameter             | Type               | Description                                                                      |
|-----------------------|--------------------|----------------------------------------------------------------------------------|
| `logoUrl`             | `boolean`          | The width of the widget in pixels.                                               |
| `hideLogo`            | `boolean`          | The height of the widget in pixels.                                              |
| `hideNetworkSelector` | `boolean`          | The container in which the widget will be displayed.                             |
