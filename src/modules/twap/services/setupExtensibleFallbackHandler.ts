import { SendTransactionsResponse } from '@safe-global/safe-apps-sdk'

import { extensibleFallbackSetupTxs } from './extensibleFallbackSetupTxs'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function setupExtensibleFallbackHandler(
  context: ExtensibleFallbackContext,
  domainVerifierAddress?: string
): Promise<SendTransactionsResponse> {
  const { safeAppsSdk } = context

  const txs = await extensibleFallbackSetupTxs(context, domainVerifierAddress)
  const response = await safeAppsSdk.txs.send({ txs })

  // TODO: process the sent transaction
  console.log('SET HANDLER: ', response)

  return response
}
