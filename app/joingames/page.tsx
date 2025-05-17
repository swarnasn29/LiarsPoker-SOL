"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSolana } from '@/app/context/SolanaContext';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

interface GameRoom {
  roomId: string;
  creator: string;
  currentState: number;
  createdAt: number;
  minBid: number;
  requiredPlayers: number;
  playerCount: number;
  currentBid: {
    bidder: string;
    digit: number;
    quantity: number;
    bidAmount: number;
    timestamp: number;
  } | null;
  lastBidder: string | null;
  currentTurn: string | null;
  winner: string | null;
  prizePool: number;
  bump: number;
  isPlayerInRoom?: boolean;
}

export default function JoinBid() {
  const router = useRouter();
  const { publicKey, connected, program, connection, PROGRAM_ID } = useSolana();
  const [activeGames, setActiveGames] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerRooms, setPlayerRooms] = useState<Set<string>>(new Set());

  const checkPlayerRooms = async () => {
    if (!program || !publicKey) return;

    try {
      const playerAccounts = await program.account.playerAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      const rooms: any = new Set<string>();
      for (const account of playerAccounts) {
        rooms.add(account.account.room.toString());
      }
      setPlayerRooms(rooms);
    } catch (error) {
      console.error("Error checking player rooms:", error);
    }
  };

  useEffect(() => {
    const loadGames = async () => {
      if (!program) {
        console.log("Program not initialized");
        setLoading(false);
        return;
      }

      try {
        // First check which rooms the player is already in
        if (publicKey) {
          const playerAccounts = await program.account.playerAccount.all([
            {
              memcmp: {
                offset: 8,
                bytes: publicKey.toBase58(),
              },
            },
          ]);
          const rooms: any = new Set(playerAccounts.map((acc: any) => acc.account.room.toString()));
          setPlayerRooms(rooms);
        }

        console.log("Fetching rooms...");
        const allRooms = await program.account.room.all();
        console.log("Fetched rooms:", allRooms);

        if (!allRooms) {
          setActiveGames([]);
          setLoading(false);
          return;
        }

        const activeRooms = allRooms.map((room: any) => {
          const roomDetails = room.account;
          return {
            roomId: room.publicKey.toString(),
            creator: roomDetails.creator.toString(),
            currentState: roomDetails.currentState.created ? 0 : 
                         roomDetails.currentState.waiting ? 1 :
                         roomDetails.currentState.inProgress ? 2 :
                         roomDetails.currentState.revealing ? 3 :
                         roomDetails.currentState.completed ? 4 : 5,
            createdAt: roomDetails.createdAt.toNumber(),
            minBid: roomDetails.minBid.toNumber(),
            requiredPlayers: roomDetails.requiredPlayers,
            playerCount: roomDetails.playerCount,
            currentBid: roomDetails.currentBid ? {
              bidder: roomDetails.currentBid.bidder.toString(),
              digit: roomDetails.currentBid.digit,
              quantity: roomDetails.currentBid.quantity,
              bidAmount: roomDetails.currentBid.bidAmount.toNumber(),
              timestamp: roomDetails.currentBid.timestamp.toNumber(),
            } : null,
            lastBidder: roomDetails.lastBidder ? roomDetails.lastBidder.toString() : null,
            currentTurn: roomDetails.currentTurn ? roomDetails.currentTurn.toString() : null,
            winner: roomDetails.winner ? roomDetails.winner.toString() : null,
            prizePool: roomDetails.prizePool.toNumber() / LAMPORTS_PER_SOL,
            bump: roomDetails.bump,
            isPlayerInRoom: playerRooms.has(room.publicKey.toString()),
          };
        }).filter((room: any) => room.currentState === 0 || room.currentState === 1);

        setActiveGames(activeRooms);
        console.log("Active rooms:", activeRooms);
      } catch (error) {
        console.error("Error loading games:", error);
        setError("Failed to load games. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [program, publicKey]);

  const handleSelectRoom = (room: GameRoom) => {
    setSelectedRoom(room);
  };

  const handleJoinGame = async () => {
    if (!publicKey || !program || !selectedRoom) {
      setError("Please connect your wallet and select a room first");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);

      const [roomPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("room"),
          new PublicKey(selectedRoom.creator).toBuffer()
        ],
        PROGRAM_ID
      );

      const [playerAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player"),
          roomPda.toBuffer(),
          publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      console.log("Joining room with accounts:", {
        roomPda: roomPda.toString(),
        playerAccountPda: playerAccountPda.toString(),
        player: publicKey.toString(),
      });

      try {
        const existingPlayerAccount = await program.account.playerAccount.fetch(playerAccountPda);
        if (existingPlayerAccount) {
          setError('You have already joined this room.');
          return;
        }
      } catch (e) {
        console.log("No existing player account found");
      }

      const tx = await program.methods
        .joinRoom()
        .accounts({
          room: roomPda,
          playerAccount: playerAccountPda,
          player: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction successful:", tx);
      router.push(`/gameplay/${roomPda.toString()}`);
    } catch (error: any) {
      console.error('Error joining game:', error);
      if (error?.message?.includes("RoomNotJoinable")) {
        setError('Room is not in a state where it can be joined.');
      } else if (error?.message?.includes("RoomFull")) {
        setError('Room is full.');
      } else if (error?.message?.includes("AccountNotInitialized")) {
        setError('Room not found or not initialized. Please try refreshing the page.');
      } else {
        setError('Failed to join game. Please try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0A]`}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />

      <div className="relative z-10 p-8">
        <h1 className="text-4xl md:text-[15vh] text-white mb-4">
          Available Tables
        </h1>
        <p className="text-zinc-400 text-[5vh] mb-12 py-4">
          Choose your table and join the game
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-2xl">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-white text-7xl">Loading games...</div>
          ) : activeGames.length === 0 ? (
            <div className="text-zinc-400 text-7xl">No active games available.....</div>
          ) : (
            activeGames.map((game) => (
              <div
                key={game.roomId}
                onClick={() => game.isPlayerInRoom ? router.push(`/gameplay/${game.roomId}`) : handleSelectRoom(game)}
                className={`group bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 hover:scale-[1.02] 
                         transition-all duration-300 border border-zinc-800 hover:border-[#98C23D]/50
                         cursor-pointer ${selectedRoom?.roomId === game.roomId ? 'border-[#98C23D]' : ''}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-5xl text-white font-semibold">
                    Room #{game.roomId.slice(0, 8)}...
                  </h2>
                  <div className="flex items-center gap-2">
                    {game.isPlayerInRoom && (
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        Your Room
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-full bg-[#98C23D]/20 text-[#98C23D] text-sm">
                      {game.currentState === 0 ? 'Created' : 'Waiting'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-3xl text-zinc-400 mb-4">
                  <div className="flex justify-between">
                    <span>Creator</span>
                    <span className="text-[#98C23D]">
                      {game.creator.slice(0, 6)}...{game.creator.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-3xl">
                    <span>Min Bid</span>
                    <span className="text-[#98C23D]">
                      {game.minBid / LAMPORTS_PER_SOL} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-3xl">
                    <span>Players</span>
                    <span className="text-[#98C23D]">
                      {game.playerCount}/{game.requiredPlayers}
                    </span>
                  </div>
                </div>

                {game.isPlayerInRoom ? (
                  <div className="mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/gameplay/${game.roomId}`);
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl px-6 py-4 rounded-lg font-medium 
                               transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      Rejoin Game
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoom(game);
                      }}
                      className="w-full bg-[#98C23D] hover:bg-[#88b22d] text-black text-2xl px-6 py-4 rounded-lg font-medium 
                               transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#98C23D]/20"
                    >
                      Select Table
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        router.push(`/gameplay/${game.roomId}`);
                      }}
                      className="w-full bg-[#98C23D] hover:bg-[#88b22d] text-black text-2xl px-6 py-4 rounded-lg font-medium 
                               transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#98C23D]/20"
                    >
                      Join Directly
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedRoom && (
          <div className="mt-12">
            <button
              onClick={handleJoinGame}
              disabled={isJoining}
              className={`w-full bg-[#98C23D] hover:bg-[#88b22d] text-black text-3xl px-8 py-6 rounded-lg font-medium 
                         transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#98C23D]/20
                         flex items-center justify-center gap-3 group
                         ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isJoining ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Joining Game...
                </>
              ) : (
                'Join Selected Table'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
