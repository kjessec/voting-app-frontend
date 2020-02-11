import React, { useState } from 'react';
import './App.css';

import { withKeyContext, ComponentProps } from './KeyContext';


const MemoApp: React.FC<ComponentProps> = ({
  useContract,
  getContract
}) => {
  const contract = useContract()

  const [state, setState] = useState('')
  const [inTransaction, setInTransaction] = useState(false)

  const onMemoInject = async (state: string) => {
    try {
      setInTransaction(true)
      const ctx = await getContract()
      const injected = await ctx.methods.main(state).send()
      await injected.confirmation()
      setState('')
      setInTransaction(false)
    } catch (e) {
      alert(e.message)
      setInTransaction(true)
    }
  }


  return (
    <div className="app">
      <header>
        Decentralized Memo<br/>
      </header>

      <main>
        <Memo content={contract?.string}/>
      </main>

      <footer>
        <label>
          <span>Content</span>
          <textarea
            placeholder="Write your memo here"
            value={state}
            disabled={inTransaction}
            onChange={ev => setState(ev.currentTarget.value) }
          />
        </label>

        <button
          disabled={inTransaction}
          onClick={() => onMemoInject(state)}
        >
          {inTransaction ? 'Waiting for block confirmation...' : 'Write Memo'}
        </button>
      </footer>
    </div>

  );
}

interface Memo {
  content: string
}
const Memo: React.FC<Memo> = ({
  content
}) => {

  return (
    <div className="memo">
      <header>
        Memo says...
      </header>

      <div>
        {content}
      </div>
    </div>
  )
}

export default withKeyContext('KT1DBaG4RWxHw8Sjoj4gwJSeQ4KBZ61TtGvX', MemoApp)
