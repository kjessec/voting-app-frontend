import React, { useState } from 'react'
import { createContext } from './context'

export type ComponentProps = ReturnType<typeof createContext>

export const withKeyContext = (
  contractAddress: string,
  Component: React.FC<ComponentProps>
) => () => {
  const [keyContext, setKeyContext] = useState({
    provided: false,
    key: '',
    passphrase: ''
  })

  const [context, setContext] = useState(createContext({
    rpc: 'http://192.168.0.171:8732',
    contractAddress: contractAddress
  }))

  const { importKey } = context

  // functions
  const onImportKeys = async (key: string, passphrase: string) => {
    importKey(key, passphrase)
      .then(() => setKeyContext({ ...keyContext, provided: true }))
      .catch(() => {
        alert('Wrong secret key or passphrase provided!')
        setKeyContext({
          provided: false,
          key: '',
          passphrase: ''
        })
      })
  }

  // key is not provided, prompt input
  if (!keyContext.provided) {
    return (
      <form className="context">
        <h1>Sign In</h1>
        <div>
          <input
            type="password"
            value={keyContext.key}
            placeholder="Enter your private key"
            onChange={ev => setKeyContext({ ...keyContext, key: ev.currentTarget.value })}
          />
          {keyContext.key.startsWith('edesk') && (
            <input
              type="password"
              value={keyContext.passphrase}
              placeholder="Enter passphrase"
              onChange={ev => setKeyContext({ ...keyContext, passphrase: ev.currentTarget.value })}
            />
          )}
        </div>

        <footer>
          <button onClick={async () => onImportKeys(
            keyContext.key,
            keyContext.passphrase
          )}>
            Sign In
          </button>
        </footer>
      </form>
    )
  }

  return <Component {...context}/>
}
