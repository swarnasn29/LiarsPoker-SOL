# 🎭 Liar's Poker: Decentralized Bluffing Game on Solana

![Built On Solana](https://img.shields.io/badge/Built%20On-Solana-3a0ca3?style=for-the-badge&logo=solana)
![License](https://img.shields.io/github/license/yourusername/liars-poker?style=for-the-badge)
![Program Status](https://img.shields.io/badge/Program%20Deployed-Devnet-success?style=for-the-badge)

Experience the classic game of deception and strategy, now reimagined on the Solana blockchain. **Liar's Poker** combines psychological bluffing with decentralized technology to deliver a trustless, on-chain gaming experience.

---

## 🎮 Game Overview

**Liar's Poker** is a game of statistical reasoning and bluffing. Traditionally played with the serial numbers on dollar bills, each player attempts to outwit others by making bold claims about the frequency of digits, challenging opponents, and calling bluffs. The objective is to be the last player standing with the most accurate predictions and the best bluffs. :contentReference[oaicite:0]{index=0}

---

## 🧠 Game Logic & Mechanics

1. **Room Creation**: A player initiates a game room on-chain, specifying parameters like the number of players and stakes.

2. **Joining the Room**: Other players join the room using its unique ID. Each participant is assigned a secret digit, stored securely on-chain.

3. **Claim Phase**: Players take turns making claims about the total number of a specific digit among all players' secrets. Each subsequent claim must be higher than the previous.

4. **Challenge Phase**: A player may challenge the previous claim if they believe it's false. Upon a challenge:
   - All players reveal their secrets.
   - The system verifies the claim.
   - If the claim is valid, the claimant wins; otherwise, the challenger wins.

5. **Game Continuation**: The game continues with players making claims and challenges until a winner emerges.

---

## 🔗 Smart Contract Details

- **Program ID**: `5p588fV3VSeGG7YjgS9h6JkmqWoNnaCzZUfEnRGCY5eM`
- **Network**: Solana Devnet
- **Framework**: [Anchor](https://www.anchor-lang.com/)
- **Language**: Rust

### Key Functions

- `initialize()`: Initializes the game program.
- `create_room(...)`: Creates a new game room with specified parameters.
- `join_room(...)`: Allows players to join an existing room.
- `reveal_secret(...)`: Enables players to reveal their secret digits.
- `fetch_room_by_id(room_id)`: Retrieves room details using the Room ID.

---

## 🖥️ Frontend Application

The frontend is crafted using modern web technologies to ensure a seamless and interactive user experience.

### Tech Stack

- **Framework**: [Next.js (TypeScript)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Blockchain Interaction**: [solana-web3.js](https://github.com/solana-labs/solana-web3.js)
- **Wallet Integration**: [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

### Features

- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Real-time Updates**: Reflects on-chain game state changes instantly.
- **Smooth Animations**: Enhances user engagement during gameplay.
- **Secure Wallet Connections**: Supports popular Solana wallets like Phantom and Solflare.

---

## 🛠️ Project Structure

```

liars-poker/
├── programs/
│   └── liars\_poker/        # Solana smart contract (Rust)
├── app/                    # Next.js frontend application
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Application pages
│   └── styles/             # Tailwind CSS configurations
├── tests/                  # Anchor integration tests
└── Anchor.toml             # Anchor configuration file

````

---

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)

### Backend Setup

1. **Install Anchor CLI**:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
   ```

3. **Clone the Repository**:

   ```bash
   git clone https://github.com/swarnasn29/liars-poker.git
   cd liars-poker
   ```

4. **Build and Deploy the Smart Contract**:

   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

### Frontend Setup

1. **Navigate to the Frontend Directory**:

   ```bash
   cd LiarsPoker-SOL
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:

   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛣️ Roadmap

* [ ] Implement on-chain reward distribution.
* [ ] Integrate Verifiable Random Functions (VRF) for enhanced randomness.
* [ ] Develop a leaderboard to track top players.
* [ ] Introduce multiplayer support with real-time updates.
* [ ] Optimize smart contract for Solana mainnet deployment.

---

## 🤝 Meet the Team

### Rythme Nagrani

A blockchain enthusiast with a passion for decentralized applications. Rythme specializes in smart contract development and has been instrumental in architecting the backend of Liar's Poker.

### Swarna Nagrani

A frontend developer with a keen eye for design and user experience. Swarna has led the development of the responsive and interactive UI, ensuring seamless integration with the Solana blockchain.

Together, Rythme and Swarna form a dynamic duo committed to bringing innovative and engaging decentralized games to the blockchain ecosystem.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📣 Acknowledgements

* [Solana](https://solana.com/) for the high-performance blockchain platform.
* [Anchor](https://www.anchor-lang.com/) for the robust framework simplifying Solana smart contract development.
* [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and [Framer Motion](https://www.framer.com/motion/) for powering the frontend experience.
* [solana-web3.js](https://github.com/solana-labs/solana-web3.js) and [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) for seamless blockchain interactions.

---

**Bluff smart. Call harder. Play decentralized.**

```

