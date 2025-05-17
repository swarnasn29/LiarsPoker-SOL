'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSolana } from '@/app/context/SolanaContext';
import { BN } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createHash } from 'crypto';

// Floating number component for background effect
const FloatingNumber = ({
  children,
  className,
}: {
  children: string;
  className: string;
}) => (
  <div
    className={`absolute font-[var(--font-minecraft)] text-4xl text-gray-800/10 animate-float ${className}`}
  >
    {children}
  </div>
);

// Helper function to generate a room ID that matches the contract's implementation
function gen_room_id(creator: PublicKey, timestamp: number): BN {
  // Create a buffer to hold the creator's public key
  const creatorBuffer = creator.toBuffer();
  
  // Create a buffer for the timestamp (8 bytes)
  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigInt64LE(BigInt(timestamp), 0);
  
  // Combine the buffers
  const combinedBuffer = Buffer.concat([creatorBuffer, timestampBuffer]);
  
  // Create a BN from the first 8 bytes of the combined buffer
  return new BN(combinedBuffer.slice(0, 8), 'le');
}

export default function CreateGame() {
  const router = useRouter();
  const { publicKey, connected, program, connection, PROGRAM_ID } = useSolana();
  const [playerCount, setPlayerCount] = useState(2);
  const [entryFee, setEntryFee] = useState(0.1);
  const [isCreating, setIsCreating] = useState(false);
  const [gameMode, setGameMode] = useState<'video' | 'ai'>('video');
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!publicKey || !program) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      // Convert entry fee to lamports
      const entryFeeInLamports = Math.floor(entryFee * LAMPORTS_PER_SOL);
      
      // Find PDA for the room using creator's public key
      const [roomPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("room"),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );
      
      console.log("Creating room with PDA:", roomPda.toString());
      console.log("Creator public key:", publicKey.toString());

      // Call the program function with the required parameters
      const tx = await program.methods
        .createRoom(
          new BN(entryFeeInLamports),
          playerCount
        )
        .accounts({
          room: roomPda,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log("Transaction:", tx);
      
      // Wait for confirmation
      await connection.confirmTransaction(tx, 'confirmed');
      
      // Fetch room details to verify creation
      await program.methods
        .fetchRoom()
        .accounts({
          room: roomPda,
        })
        .rpc();

      // Redirect to the gameplay page with the room PDA
      router.push(`/gameplay/${roomPda.toString()}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      if (error?.message?.includes("InvalidPlayerCount")) {
        setError('Invalid number of players. Must be between 2 and 6.');
      } else if (error?.message?.includes("InvalidBidAmount")) {
        setError('Bid amount must be greater than zero.');
      } else if (error?.message?.includes("TransactionExpiredTimeoutError")) {
        setError('Transaction timed out. Please try again.');
      } else if (error?.message?.includes("Signature verification failed")) {
        setError('Transaction signing failed. Please try again.');
      } else if (error?.message?.includes("ConstraintSeeds")) {
        setError('Error creating room. Please try again.');
      } else if (error?.message?.includes("already in use")) {
        setError('You already have an active room. Please complete or cancel it first.');
      } else {
        setError('Failed to create game. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0A]`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />

      {/* Floating Numbers Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none text-white">
        <FloatingNumber className="top-[15%] left-[10%] animate-float-slow text-white">A</FloatingNumber>
        <FloatingNumber className="top-[40%] left-[20%] animate-float-delayed text-white">K</FloatingNumber>
        <FloatingNumber className="top-[70%] left-[15%] animate-float text-white">Q</FloatingNumber>
        <FloatingNumber className="top-[25%] right-[15%] animate-float-slow text-white">J</FloatingNumber>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-[18vh] md:text-7xl text-white font-[var(--font-pixel)] mb-6 animate-fade-in">
            Create a new Liar's Poker
          </h1>
          <p className="text-zinc-400 text-5xl">Set up your perfect game</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-2xl">{error}</p>
          </div>
        )}

        {/* Game Creation Form */}
        <div className="max-w-3xl w-full mx-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Player Count Input */}
            <div className="group bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-8 border border-zinc-800 hover:border-[#98C23D]/50 transition-all">
              <label className="block text-zinc-400 text-3xl mb-4">
                Number of Players
              </label>
              <input
                type="number"
                min="2"
                max="6"
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.min(6, Math.max(2, parseInt(e.target.value) || 2)))}
                className="w-full bg-zinc-900 text-[#98C23D] border border-zinc-700 rounded-lg px-6 py-4 text-3xl focus:outline-none focus:border-[#98C23D] transition-all"
                placeholder="2-6 players"
              />
            </div>

            {/* Initial Stake Input */}
            <div className="group bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-8 border border-zinc-800 hover:border-[#98C23D]/50 transition-all">
              <label className="block text-zinc-400 text-3xl mb-4">
                Minimum Bid (SOL)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={entryFee}
                onChange={(e) => setEntryFee(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full bg-zinc-900 text-[#98C23D] border border-zinc-700 rounded-lg px-6 py-4 text-3xl focus:outline-none focus:border-[#98C23D] transition-all"
                placeholder="Minimum 0.1 SOL"
              />
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-12">
            <h3 className="text-white text-5xl font-[var(--font-pixel)] mb-8 text-center">
              Select Game Mode
            </h3>

            <div className="space-y-6">
              {/* Video & Voice Option */}
              <div 
                onClick={() => setGameMode('video')}
                className="group cursor-pointer bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-8 border border-zinc-800 hover:border-[#98C23D]/50 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 h-8 rounded-full border-2 border-[#98C23D] flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${gameMode === 'video' ? 'bg-[#98C23D]' : 'bg-transparent'}`} />
                  </div>
                  <div>
                    <h4 className="text-white text-3xl mb-2">Video & Voice</h4>
                    <p className="text-zinc-400">
                      Full immersive experience with video and voice chat
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Text Chat Option */}
              <div 
                onClick={() => setGameMode('ai')}
                className="group cursor-pointer bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-8 border border-zinc-800 hover:border-[#98C23D]/50 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 h-8 rounded-full border-2 border-[#98C23D] flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${gameMode === 'ai' ? 'bg-[#98C23D]' : 'bg-transparent'}`} />
                  </div>
                  <div>
                    <h4 className="text-white text-3xl mb-2">AI Text Chat</h4>
                    <p className="text-zinc-400">
                      Play with AI-powered chat for a unique experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="mt-12">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className={`w-full bg-[#98C23D] hover:bg-[#88b22d] text-black text-3xl px-8 py-6 rounded-lg font-medium 
                         transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#98C23D]/20
                         flex items-center justify-center gap-3 group
                         ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCreating ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Game...
                </>
              ) : (
                'Create Game'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}