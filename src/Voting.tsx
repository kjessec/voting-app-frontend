import React, { useState } from 'react';
import { withKeyContext, ComponentProps } from './KeyContext'
import './App.css';

type VoteContext = [
  { string: string },
  { int: string }
]

const Voting: React.FC<ComponentProps> = ({
  useContract,
  getContract
}) => {
  const contract = useContract() 

  // votes
  const storage = contract?.args[0]?.args[0]?.args[0]?.map((item: any) => item.args) as VoteContext[]
  const isElectionClosed = contract?.args[1]?.prim === 'True'
  
  const [state, setState] = useState('')
  const [inTransaction, setInTransaction] = useState(isElectionClosed)

  // functions
  const onVote = async (name: string) => {
    try {
      setInTransaction(true)
      const ctx = await getContract()
      const voted = await ctx.methods.vote(name).send()
      await voted.confirmation()
      setInTransaction(false)
    } catch(e) {
      alert(e.message)
      setInTransaction(false)
    }
  }

  const onRemoveCandidate = async (name: string) => {
    try {
      setInTransaction(true)
      const ctx = await getContract()
      const voted = await ctx.methods.remove_candidate(name).send()
      await voted.confirmation()
      setInTransaction(false)
    } catch(e) {
      alert(e.message)
      setInTransaction(false)
    }

  }

  const onCloseElection = async () => {
    try {
      setInTransaction(true)
      const ctx = await getContract()
      const voted = await ctx.methods.close_election().send()
      await voted.confirmation()
      setInTransaction(false) 
    } catch(e) {
      alert(e.message)
      setInTransaction(false)
    }
  }

  const onAddCandidate = async (name: string) => {
    try {
      setInTransaction(true)
      const ctx = await getContract()
      const voted = await ctx.methods.add_candidate(name).send()
      await voted.confirmation()
      setInTransaction(false)
    } catch(e) {
      alert(e.message)
      setInTransaction(false)
    }
  }

  return (
    <div className="app">
      <header>
        Decentralized Voting <br/>
        {isElectionClosed && <h1>Election is Closed!</h1>} <br/>
        {inTransaction && <p>Waiting for a block confirmation...</p>}
      </header>

      <main className="vote">
        {(storage || []).map(item => (
          <Votee
            key={item[0].string}
            name={item[0].string}
            count={+item[1].int}
            inTransaction={inTransaction}
            onVote={onVote}
            onRemoveCandidate={onRemoveCandidate}
          />
        ))}
      </main>

      <footer>
        <div>
          <h4>Add Candidate</h4>
          <div>
            <input
              type="text"
              value={state}
              disabled={inTransaction}
              onChange={ev => setState(ev.currentTarget.value)}
            />
            <button
              onClick={() => onAddCandidate(state)}
              disabled={inTransaction}
            >
              Add candidate {state}
            </button>
          </div>
        </div>

        <div>
          <h4>Close Election</h4>
          <button
            disabled={inTransaction}
            onClick={() => {
              if(window.confirm('Close this election? This action is irreversable.')) {
                onCloseElection()
              }
            }}
          >
            Close Election
          </button>
        </div>
      </footer>
    </div>

  );
}

interface Votee {
  name: string,
  count: number,
  inTransaction: boolean,
  onVote: (name: string) => void,
  onRemoveCandidate: (name: string) => void,
}
const Votee: React.FC<Votee> = ({
  name,
  count,
  inTransaction,
  onVote,
  onRemoveCandidate
}) => {
  return (
    <div className="votee">
      <h4>{name}</h4>
      <p>{count}</p>

      <footer>
        <button
          disabled={inTransaction}
          onClick={() => onVote(name)}
        >Vote for this candidate</button>
        <button
          disabled={inTransaction}
          onClick={() => onRemoveCandidate(name)}
        >
          Remove this candidate
        </button>
      </footer>
    </div>
  )
}

export default withKeyContext('KT1L6hJeetJVbxzMxtH2CjK7onB34H2tCG6z', Voting)