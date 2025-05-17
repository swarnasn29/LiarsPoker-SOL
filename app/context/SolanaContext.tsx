'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import IDL from '@/idl.json';

// Program ID
const PROGRAM_ID = new PublicKey('5p588fV3VSeGG7YjgS9h6JkmqWoNnaCzZUfEnRGCY5eM');

// Create the context
const SolanaContext = createContext<any>(null);

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [program, setProgram] = useState<Program | null>(null);
  const [connection] = useState(() => new Connection('https://api.devnet.solana.com', 'confirmed'));

  useEffect(() => {
    if (publicKey) {
      // Get wallet balance
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });

      // Initialize program
      const provider = new AnchorProvider(
        connection,
        window.solana,
        { commitment: 'confirmed' }
      );
      
      // Initialize program with IDL and program ID
      const program = new Program(IDL as any, PROGRAM_ID, provider);
      setProgram(program);
    }
  }, [publicKey, connection]);

  const value = {
    publicKey,
    connected,
    connect,
    disconnect,
    balance,
    program,
    connection,
    PROGRAM_ID
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
}

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}; 