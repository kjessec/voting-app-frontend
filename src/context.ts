import { useEffect, useState } from 'react'
import { Tezos } from '@taquito/taquito'

interface Context {
  rpc: string,
  contractAddress: string
}

export const createContext = ({
  rpc,
  contractAddress
}: Context) => {
  // set rpc provider
  Tezos.setProvider({ rpc })
  
  return {
    useContract() {
      const [state, setState] = useState()
      const getContract = async () => {
        const { script } = await Tezos.rpc.getContract(contractAddress)
        setState(script.storage)
      }

      // refresh contract state every second
      useEffect(() => {
        const interval = setInterval(getContract, 1000)
        return () => clearInterval(interval)
      }, [contractAddress])

      return state
    },
    
    async importKey(key: string, passphrase?: string) {
      return Tezos.importKey(key, passphrase)
    },

    async getContract() {
      return await Tezos.contract.at(contractAddress)
    },

    async injectMemo(content: string) {
      const contract = await Tezos.contract.at(contractAddress)
      const response = await contract.methods.main(content).send()
      return await response.confirmation()
    }
  }
}
