# 🃏 Liar’s Poker on Solana

> A high-stakes, trust-breaking, bluff-calling game brought to life on-chain — built with Solana smart contracts using Anchor.

![Solana](https://img.shields.io/badge/Built%20On-Solana-3a0ca3?style=for-the-badge&logo=solana)
![License](https://img.shields.io/github/license/yourusername/liars-poker?style=for-the-badge)
![Program Status](https://img.shields.io/badge/Program%20Deployed-Devnet-success?style=for-the-badge)

---

## 🚀 Overview

**Liar's Poker** is a battle of deception, logic, and guts. Each player receives a secret number, and the game unfolds in rounds of daring claims — with the looming threat of being called a liar.

We've brought this intense psychological game to the blockchain. Powered by **Solana** and built using **Anchor Framework**, this smart contract enables decentralized gameplay with verifiable outcomes and zero trust assumptions.

> Think you can outsmart your friends when every move is on-chain? Prove it.

---

## 🔗 Program Details

- **Network**: Solana Devnet  
- **Program ID**: `5p588fV3VSeGG7YjgS9h6JkmqWoNnaCzZUfEnRGCY5eM`  
- **Framework**: [Anchor](https://www.anchor-lang.com/)  
- **Language**: Rust (on-chain), TypeScript/JS (off-chain integration)  

---

## ✨ Features

- ✅ **Create Room** — Start a new Liar’s Poker game room with custom configuration  
- ✅ **Join Room** — Allow multiple players to join before the game begins  
- ✅ **Reveal Secret** — Reveal your hidden number once the round ends  
- ✅ **Fetch Room Details** — Instantly get room information by just passing the Room ID  
- 🔐 **Immutable and Trustless** — No central authority; all game logic is enforced on-chain  
- ⚡ **Built for Speed** — Utilizes Solana’s blazing fast transaction speeds for smooth gameplay

---

## 📦 Smart Contract Functions

### 📌 `initialize()`
Initializes the game configuration and deploys the contract.

### 📌 `createRoom(...)`
Creates a new game room with a unique Room ID.

### 📌 `joinRoom(...)`
Allows players to join an open room before the game starts.

### 📌 `revealSecret(...)`
Lets a player reveal their hidden number securely.

### 📌 `fetchRoomById(room_id)`
Returns complete room details (players, status, etc.) given a Room ID.

---

## 🧠 Gameplay Summary

1. **Create Room**  
   One player initializes a game room on Solana with custom parameters.

2. **Join Room**  
   Others join using the unique Room ID. Each gets a secret number.

3. **Start Bluffing**  
   Players take turns making claims about how many times a digit appears across all hands.

4. **Call Liar**  
   Think someone’s lying? Call them out. Smart contract verifies the truth.

5. **Winner Gets Rewarded**  
   The contract determines the winner and distributes the prize.

---

## 🛠️ Tech Stack

| Layer            | Technology         |
|------------------|--------------------|
| **Blockchain**   | Solana             |
| **Framework**    | Anchor             |
| **Language**     | Rust               |
| **Client Tools** | TypeScript, Solana CLI |
| **Network**      | Devnet             |

---

## 📁 Project Structure

```

liars-poker/
│
├── programs/
│   └── liars\_poker/      # Anchor smart contract
│       └── src/lib.rs
│
├── tests/                # Integration tests
│   └── liars\_poker.ts
│
├── migrations/           # Anchor deploy config
│
└── Anchor.toml

````

---

## 🚧 Future Improvements

- [ ] Add wager/pot system with SPL Token support
- [ ] UI/UX frontend for browser-based play
- [ ] Advanced cheating detection and punishment logic
- [ ] Cross-room leaderboard and analytics dashboard

---

## 📷 Sneak Peek (Coming Soon)

> 👀 A browser-based UI for Liar’s Poker is in the works!

---

## 🧑‍💻 Local Development & Testing

### 1. Install Anchor and Rust

```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
rustup update stable
````

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/liars-poker.git
cd liars-poker
```

### 3. Build and Test the Contract

```bash
anchor build
anchor test
```

### 4. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

> Note: Make sure your wallet is funded using [Solana Faucet](https://solfaucet.com/) and your `Anchor.toml` is configured correctly.

---

## 🤝 Contributing

We welcome contributions! Here’s how you can help:

* 🐞 Report bugs
* 🧠 Suggest new features
* 💻 Submit PRs
* 📣 Spread the word

---

## 📜 License

MIT License — feel free to use, remix, and play on.

---

## 👋 Made with ❤️ for Hackathons

Crafted by builders who love blending strategy, cryptography, and game theory on-chain.

---

> **Liar’s Poker** — where every bluff is on the blockchain.

```

---
