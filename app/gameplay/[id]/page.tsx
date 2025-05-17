'use client';
import { useState, useEffect } from 'react';
import { useSolana } from '@/app/context/SolanaContext';
import React, { use } from 'react';
import { FaVideo, FaMicrophone, FaHistory } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { RiHashtag } from 'react-icons/ri';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

// Enhanced ParticipantCircle component
const ParticipantCircle = ({ 
  player, 
  position, 
  totalPlayers, 
  isCurrentTurn,
  status,
  lastAction,
  serialNumber 
}: any) => {
  const angle = (position * 360) / totalPlayers;
  const baseRadius = 200;
  const radius = totalPlayers <= 4 ? baseRadius : baseRadius * (4 / totalPlayers);
  const circleSize = totalPlayers <= 4 ? 130 : Math.max(50, 80 * (4 / totalPlayers));
  
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ 
        left: `calc(50% + ${x}px)`, 
        top: `calc(50% + ${y}px)`,
        width: `${circleSize}px`,
        height: `${circleSize}px`
      }}
    >
      <div 
        className={`relative w-full h-full rounded-full flex flex-col items-center justify-center
          transition-all duration-300 border-2 hover:scale-110 group
          ${isCurrentTurn 
            ? 'bg-[#98C23D]/20 border-[#98C23D] scale-110 shadow-lg shadow-[#98C23D]/20' 
            : 'bg-zinc-800/50 border-zinc-700'
          }`}
      >
        {/* Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full 
          ${status === 'active' ? 'bg-[#98C23D]' : 'bg-zinc-500'} 
          animate-pulse`} 
        />
        
        {/* Player Address */}
        <span className="text-3xl text-white mb-1">
          {player.slice(0, 6)}...
        </span>

        {/* Serial Number (if revealed) */}
        {serialNumber && (
          <span className="text-2xl text-[#98C23D]">
            {serialNumber}
          </span>
        )}
        
        {/* Last Action Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
          bg-zinc-800 px-2 py-1 rounded text-3xl text-white whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {lastAction}
        </div>
      </div>
    </div>
  );
};

interface Bid {
  bidder: string;
  digit: number;
  quantity: number;
  bidAmount: number;
  timestamp: number;
}

interface GameState {
  roomId: string;
  creator: string;
  currentState: number;
  createdAt: number;
  minBid: number;
  requiredPlayers: number;
  playerCount: number;
  currentBid: Bid | null;
  lastBidder: string | null;
  currentTurn: string | null;
  winner: string | null;
  prizePool: number;
  players: string[];
}

export default function GameplayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { publicKey, program, connection, PROGRAM_ID } = useSolana();
  const { connect, connecting } = useWallet();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomPda, setRoomPda] = useState<PublicKey | null>(null);
  const [bidInput, setBidInput] = useState({ digit: 0, quantity: 1, betAmount: 0 });
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{player: string, message: string}>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [bidsHistory, setBidsHistory] = useState<Bid[]>([]);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<{
    address: string;
    amount: string;
    reason: string;
  } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const initializeRoom = async () => {
      if (!program) {
        setError("Please connect your wallet first");
        setLoading(false);
        return;
      }

      try {
        // Find the room PDA using the room ID from params
        const [pda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("room"),
            new PublicKey(resolvedParams.id).toBuffer()
          ],
          PROGRAM_ID
        );
        setRoomPda(pda);

        // Sample data for development
        const samplePlayers = [
          "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
          "7v91N7iZ9mNicL8WfG6cgSCKyRXydQjLh6UYBWwm6y1M",
          "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          "2xNwGYPxsX7jVWxq7YxP7o2Wt1fRz7XqJ7XqJ7XqJ7Xq"
        ];

        const sampleBids = [
          {
            bidder: samplePlayers[0],
            digit: 5,
            quantity: 3,
            bidAmount: 0.5 * LAMPORTS_PER_SOL,
            timestamp: Date.now() - 30000
          },
          {
            bidder: samplePlayers[1],
            digit: 6,
            quantity: 4,
            bidAmount: 0.7 * LAMPORTS_PER_SOL,
            timestamp: Date.now() - 20000
          },
          {
            bidder: samplePlayers[2],
            digit: 7,
            quantity: 5,
            bidAmount: 1.0 * LAMPORTS_PER_SOL,
            timestamp: Date.now() - 10000
          }
        ];

        // Transform the room data into our GameState interface
        const transformedState: GameState = {
          roomId: resolvedParams.id,
          creator: samplePlayers[0],
          currentState: 2, // In Progress
          createdAt: Date.now() - 3600000, // 1 hour ago
          minBid: 0.1 * LAMPORTS_PER_SOL,
          requiredPlayers: 4,
          playerCount: samplePlayers.length,
          currentBid: sampleBids[sampleBids.length - 1],
          lastBidder: samplePlayers[2],
          currentTurn: samplePlayers[3],
          winner: null,
          prizePool: 2.2, // 2.2 SOL
          players: samplePlayers,
        };

        setGameState(transformedState);
        setBidsHistory(sampleBids);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing room:", error);
        setError("Failed to load game room. Please try again.");
        setLoading(false);
      }
    };

    initializeRoom();
  }, [program, publicKey, resolvedParams.id]);

  const handleMakeBid = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player"),
          roomPda.toBuffer(),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      await program.methods
        .placeBid(
          bidInput.digit,
          bidInput.quantity,
          new BN(bidInput.betAmount * LAMPORTS_PER_SOL)
        )
        .accounts({
          room: roomPda,
          playerAccount: playerAccountPda,
          player: publicKey,
        })
        .rpc();

      setBidInput({ digit: 0, quantity: 1, betAmount: 0 });
    } catch (error: any) {
      console.error("Error making bid:", error);
      if (error?.message?.includes("NotYourTurn")) {
        setError("It's not your turn!");
      } else if (error?.message?.includes("InvalidBid")) {
        setError("Invalid bid. Must increase either quantity, digit value, or bid amount.");
      } else {
        setError("Failed to place bid. Please try again.");
      }
    }
  };

  const handleCallLiar = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      await program.methods
        .challenge()
        .accounts({
          room: roomPda,
          player: publicKey,
        })
        .rpc();
    } catch (error: any) {
      console.error("Error calling liar:", error);
      if (error?.message?.includes("NotYourTurn")) {
        setError("It's not your turn!");
      } else if (error?.message?.includes("NoBidToChallenge")) {
        setError("No bid to challenge!");
      } else {
        setError("Failed to call liar. Please try again.");
      }
    }
  };

  const handleRevealNumber = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      setIsRevealing(true);
      await program.methods
        .reveal()
        .accounts({
          room: roomPda,
          player: publicKey,
        })
        .rpc();
    } catch (error: any) {
      console.error("Error revealing number:", error);
      setError("Failed to reveal number. Please try again.");
    } finally {
      setIsRevealing(false);
    }
  };

  // Now you can use updateGameState in handleStartGame
  const handleStartGame = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      setIsStartingGame(true);

      // First, verify that the current user is the room creator
      const roomAccount = await program.account.room.fetch(roomPda);
      if (!roomAccount.creator.equals(publicKey)) {
        throw new Error("Only the room creator can start the game");
      }

      // Verify that the room is in the correct state
      if (!roomAccount.currentState.waiting) {
        throw new Error("Room must be in waiting state to start the game");
      }

      // Get all player accounts for this room
      const playerAccounts = await program.account.playerAccount.all([
        {
          memcmp: {
            offset: 8, // Skip the account discriminator
            bytes: roomPda.toBase58(),
          },
        },
      ]);

      // Verify that we have enough players
      if (playerAccounts.length < roomAccount.requiredPlayers) {
        throw new Error(`Need at least ${roomAccount.requiredPlayers} players to start the game`);
      }

      // Call the startGame instruction
      const tx = await program.methods
        .startGame()
        .accounts({
          room: roomPda,
          player: publicKey,
        })
        .rpc();

      console.log("Game started successfully:", tx);

      // Update the game state
      await updateGameState();

    } catch (error: any) {
      console.error("Error starting game:", error);
      if (error?.message?.includes("NotAuthorized")) {
        setError("Only the room creator can start the game.");
      } else if (error?.message?.includes("NotEnoughPlayers")) {
        setError("Not enough players to start the game.");
      } else if (error?.message?.includes("InvalidState")) {
        setError("Room must be in waiting state to start the game.");
      } else {
        setError("Failed to start game. Please try again.");
      }
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleSendChat = () => {
    if (!chatMessage.trim() || !publicKey) return;

    setChatHistory(prev => [...prev, {
      player: publicKey.toString(),
      message: chatMessage.trim()
    }]);
    setChatMessage('');
  };

  // Add a join room function
  const handleJoinRoom = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      // Derive the player account PDA
      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player"),
          roomPda.toBuffer(),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      // Call the join_room instruction
      const tx = await program.methods
        .joinRoom()
        .accounts({
          room: roomPda,
          playerAccount: playerAccountPda,
          player: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Joined room successfully:", tx);
      
      // Update the game state after joining
      await updateGameState();

    } catch (error: any) {
      console.error("Error joining room:", error);
      if (error?.message?.includes("RoomNotJoinable")) {
        setError("Room is not in a state where it can be joined.");
      } else if (error?.message?.includes("RoomFull")) {
        setError("Room is full.");
      } else if (error?.message?.includes("AccountNotInitialized")) {
        setError("Room not found or not initialized. Please try refreshing the page.");
      } else {
        setError("Failed to join room. Please try again.");
      }
    }
  };

  // Add this function inside the GameplayPage component
  const updateGameState = async () => {
    if (!program || !publicKey || !roomPda) return;

    try {
      // Fetch room details
      await program.methods
        .fetchRoom()
        .accounts({
          room: roomPda,
        })
        .rpc();

      // Get the room account data
      const roomAccount = await program.account.room.fetch(roomPda);

      // Derive the player account PDA
      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player"),
          roomPda.toBuffer(),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      // Fetch player details
      await program.methods
        .fetchPlayerDetails()
        .accounts({
          playerAccount: playerAccountPda,
        })
        .rpc();

      // Get the player account data
      const playerAccount = await program.account.playerAccount.fetch(playerAccountPda);

      // Update game state with the latest data
      setGameState(prevState => ({
        ...prevState!,
        roomId: roomAccount.roomId.toString(),
        creator: roomAccount.creator.toString(),
        currentState: roomAccount.currentState.created ? 0 : 
                     roomAccount.currentState.waiting ? 1 :
                     roomAccount.currentState.inProgress ? 2 :
                     roomAccount.currentState.revealing ? 3 :
                     roomAccount.currentState.completed ? 4 : 5,
        createdAt: roomAccount.createdAt.toNumber(),
        minBid: roomAccount.minBid.toNumber(),
        requiredPlayers: roomAccount.requiredPlayers,
        playerCount: roomAccount.playerCount,
        currentBid: roomAccount.currentBid ? {
          bidder: roomAccount.currentBid.bidder.toString(),
          digit: roomAccount.currentBid.digit,
          quantity: roomAccount.currentBid.quantity,
          bidAmount: roomAccount.currentBid.bidAmount.toNumber(),
          timestamp: roomAccount.currentBid.timestamp.toNumber(),
        } : null,
        lastBidder: roomAccount.lastBidder ? roomAccount.lastBidder.toString() : null,
        currentTurn: roomAccount.currentTurn ? roomAccount.currentTurn.toString() : null,
        winner: roomAccount.winner ? roomAccount.winner.toString() : null,
        prizePool: roomAccount.prizePool.toNumber() / LAMPORTS_PER_SOL,
        players: prevState?.players || [], // Keep existing players array
      }));

      // Handle game state changes
      if (roomAccount.currentState === 3) { // Revealing state
        setIsRevealing(true);
      } else if (roomAccount.currentState === 4) { // Completed state
        setShowWinnerModal(true);
        setWinner({
          address: roomAccount.winner?.toString() || '',
          amount: (roomAccount.prizePool * LAMPORTS_PER_SOL).toString(),
          reason: 'Game completed',
        });
      }

    } catch (error) {
      console.error('Error updating game state:', error);
      setError('Failed to update game state. Please try refreshing the page.');
    }
  };

  // Remove the automatic update interval
  useEffect(() => {
    if (!program || !publicKey || !roomPda) return;

    // Set up event listeners for real-time updates
    const roomListener = program.addEventListener('RoomFetched', (event: any) => {
      console.log('Room updated:', event);
      updateGameState();
    });

    const playerListener = program.addEventListener('PlayerDetailsFetched', (event: any) => {
      console.log('Player details updated:', event);
      updateGameState();
    });

    // Cleanup
    return () => {
      program.removeEventListener(roomListener);
      program.removeEventListener(playerListener);
    };
  }, [program, publicKey, roomPda]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-4xl">Loading game room...</div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
          <div className="bg-zinc-900/50 rounded-2xl p-8 max-w-2xl w-full text-center">
            <h1 className="text-4xl text-white mb-6">Connect Your Wallet</h1>
            <p className="text-zinc-400 text-xl mb-8">
              Please connect your Solana wallet to continue playing.
            </p>
            <button
              onClick={() => connect()}
              disabled={connecting}
              className="bg-[#98C23D] hover:bg-[#88b22d] text-black text-xl px-8 py-4 rounded-lg 
                       font-medium transition-all duration-300 disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
            >
              {connecting ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="bg-zinc-900/50 rounded-2xl p-8 max-w-2xl w-full text-center">
            <h1 className="text-4xl text-red-500 mb-6">Error</h1>
            <p className="text-zinc-400 text-xl mb-8">{error}</p>
            <button
              onClick={() => router.push('/joingames')}
              className="bg-[#98C23D] hover:bg-[#88b22d] text-black text-xl px-8 py-4 rounded-lg 
                       font-medium transition-all duration-300"
            >
              Return to Game Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-4xl">Game room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />

      <div className="relative z-10 p-8">
        {/* Game Status */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl text-white">
            Room #{gameState.roomId.slice(0, 8)}...
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-[#98C23D]/20 text-[#98C23D]">
              {gameState.currentState === 0 ? 'Created' :
               gameState.currentState === 1 ? 'Waiting' :
               gameState.currentState === 2 ? 'In Progress' :
               gameState.currentState === 3 ? 'Revealing' :
               gameState.currentState === 4 ? 'Completed' : 'Unknown'}
            </div>
            <div className="text-white text-2xl">
              Prize Pool: {gameState.prizePool} SOL
            </div>
          </div>
        </div>

        {/* Game Board with Circular Player Layout */}
        <div className="relative h-[600px] bg-zinc-900/50 rounded-2xl mb-8 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center Circle */}
            <div className="w-32 h-32 rounded-full bg-[#98C23D]/10 border-2 border-[#98C23D]/20 flex items-center justify-center">
              <span className="text-[#98C23D] text-2xl">Game Room</span>
            </div>
          </div>
          
          {/* Players in Circle */}
          {gameState.players?.map((player, index) => {
            const angle = (index * 360) / gameState.players.length;
            const radius = 250; // Distance from center
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={player}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div 
                  className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center
                    transition-all duration-300 border-2 hover:scale-110 group
                    ${gameState.currentTurn === player 
                      ? 'bg-[#98C23D]/20 border-[#98C23D] scale-110 shadow-lg shadow-[#98C23D]/20' 
                      : 'bg-zinc-800/50 border-zinc-700'
                    }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full 
                    ${gameState.currentTurn === player ? 'bg-[#98C23D]' : 'bg-zinc-500'} 
                    animate-pulse`} 
                  />
                  
                  {/* Player Address */}
                  <span className="text-xl text-white mb-1">
                    {player.slice(0, 6)}...
                  </span>

                  {/* Last Action */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                    bg-zinc-800 px-2 py-1 rounded text-sm text-white whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {bidsHistory.find(bid => bid.bidder === player)?.quantity + " " + 
                     bidsHistory.find(bid => bid.bidder === player)?.digit || "Waiting"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Bidding */}
          <div className="space-y-4">
            <div className="bg-zinc-900/50 rounded-xl p-6">
              <h2 className="text-2xl text-white mb-4">Place Your Bid</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-lg">Digit (0-9)</label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={bidInput.digit}
                    onChange={(e) => setBidInput(prev => ({ ...prev, digit: parseInt(e.target.value) }))}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-white text-lg">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={bidInput.quantity}
                    onChange={(e) => setBidInput(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-white text-lg">Bet Amount (SOL)</label>
                  <input
                    type="number"
                    min={gameState.minBid / LAMPORTS_PER_SOL}
                    step="0.1"
                    value={bidInput.betAmount}
                    onChange={(e) => setBidInput(prev => ({ ...prev, betAmount: parseFloat(e.target.value) }))}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 mt-1"
                  />
                </div>
                <button
                  onClick={handleMakeBid}
                  disabled={!gameState.currentTurn || gameState.currentState !== 2}
                  className="w-full bg-[#98C23D] hover:bg-[#88b22d] text-black px-6 py-3 rounded-lg 
                           font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Bid
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCallLiar}
                disabled={!gameState.currentTurn || gameState.currentState !== 2}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg 
                         font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Call Liar
              </button>
              <button
                onClick={handleRevealNumber}
                disabled={!gameState.currentTurn || gameState.currentState !== 3}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg 
                         font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRevealing ? 'Revealing...' : 'Reveal Number'}
              </button>
            </div>

            {/* Start Game Button (for room creator) */}
           
                <button
                  onClick={handleStartGame}
                  disabled={isStartingGame}
                  className="w-full bg-[#98C23D] hover:bg-[#88b22d] text-black px-6 py-3 rounded-lg 
                           font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingGame ? 'Starting Game...' : 'Start Game'}
                </button>
              
          </div>

          {/* Right Column - Chat and History */}
          <div className="space-y-4">
            {/* Chat */}
            <div className="bg-zinc-900/50 rounded-xl p-6 h-[300px] flex flex-col">
              <h2 className="text-2xl text-white mb-4">Chat</h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="text-white">
                    <span className="text-[#98C23D]">{chat.player.slice(0, 6)}...</span>: {chat.message}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type your message..."
                  className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-2"
                />
                <button
                  onClick={handleSendChat}
                  className="bg-[#98C23D] hover:bg-[#88b22d] text-black px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Bids History */}
            <div className="bg-zinc-900/50 rounded-xl p-6 h-[300px]">
              <h2 className="text-2xl text-white mb-4">Bids History</h2>
              <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
                {bidsHistory.map((bid, index) => (
                  <div key={index} className="text-white">
                    <span className="text-[#98C23D]">{bid.bidder.slice(0, 6)}...</span> bid {bid.quantity} {bid.digit}s for {bid.bidAmount / LAMPORTS_PER_SOL} SOL
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-0 left-0 bg-black/80 text-white p-4 z-50">
            <h3>Debug Info:</h3>
            <pre>
              {JSON.stringify({
                hasGameState: !!gameState,
                hasRoomPda: !!roomPda,
                currentUser: publicKey?.toString(),
                error: error,
                gameState: gameState ? {
                  currentState: gameState.currentState,
                  playerCount: gameState.playerCount,
                  requiredPlayers: gameState.requiredPlayers,
                  isMyTurn: gameState.currentTurn === publicKey?.toString()
                } : null
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
