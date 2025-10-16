# PulseAid

A full-stack Web3 crowdfunding platform built for Celo blockchain, featuring AI-powered verification and NFT badge rewards.

## 🎯 Project Overview

PulseAid is a hackathon-ready MVP that revolutionizes crowdfunding through blockchain technology, AI verification, and mobile-first design. The platform supports two campaign modes: **Pure Kindness** (immediate release) and **Escrow/Goal** (conditional release), with NFT badge rewards for donors.

## 🏗️ Architecture

### Core Components

- **Frontend**: Next.js mobile-first app with Celo wallet integration
- **Backend**: Node.js/Express API with MongoDB for campaign management
- **Contracts**: Solidity smart contracts on Celo Alfajores testnet
- **AI Service**: Mock AI verification service (expandable to real AI)
- **IPFS**: Decentralized storage for campaign proofs and metadata
- **NFT Badges**: ERC-721 tokens for donor recognition

### Campaign Modes

1. **Pure Kindness**: Immediate fund release for humanitarian causes
2. **Escrow/Goal**: Conditional release based on AI verification and goal achievement

## 🚀 Key Features

- **Mobile-First Design**: Optimized for Valora wallet and mobile devices
- **AI Verification**: Mock AI service for proof verification (expandable)
- **NFT Rewards**: ERC-721 badges for donors based on contribution
- **IPFS Storage**: Decentralized proof storage
- **Celo Integration**: Native CELO token support
- **Admin Panel**: Campaign approval and fund management

## 🛠️ Tech Stack

### Blockchain & Web3

- **Network**: Celo Alfajores Testnet
- **Smart Contracts**: Solidity 0.8.19
- **Wallet**: Valora/Celo ContractKit
- **Storage**: IPFS via Web3.Storage

### Frontend

- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: @celo-tools/use-contractkit
- **State**: React Hooks

### Backend

- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer
- **Blockchain**: Ethers.js

### AI & Verification

- **Service**: Express microservice
- **Storage**: IPFS for proof documents
- **Future**: OpenAI integration ready

## 📁 Project Structure

```
pulseaid/
├── frontend/          # Next.js mobile-first app
├── backend/           # Express API server
├── contracts/         # Solidity smart contracts
├── ai/               # AI verification service
├── assets/           # Images and static files
├── scripts/          # Deployment and demo scripts
├── docs/             # Documentation and pitch materials
└── .env.example      # Environment variables template
```

## 🎨 Design System

### Color Palette

- **Primary**: #0F62FE (Electric Blue)
- **Accent**: #00C2A8 (Celo Teal)
- **Background**: #0B1020 (Dark Navy)
- **Cards**: #0E1726 (Lighter Navy)
- **Muted**: #98A0B3 (Light Gray)

### Typography

- **Font**: Inter (Google Fonts)
- **Mobile**: 16px base, 48px CTA buttons
- **Rounded**: 1rem border radius

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Celo Alfajores testnet access
- Valora wallet (mobile)

### Installation

1. **Clone and setup**

```bash
git clone https://github.com/DouglasBagambe/pulseaid.git
cd pulseaid
npm install
```

2. **Environment setup**

```bash
cp .env.example .env
# Fill in your API keys and private keys
```

3. **Start development**

```bash
# Start all services
npm run start:frontend    # Frontend on :3000
npm run start:backend     # Backend on :4000
npm run start:ai          # AI service on :5001
npm run deploy:contracts  # Deploy to Alfajores
```

## 🎬 Demo Flow

1. **Create Campaign**: Upload proof, set goal, choose mode
2. **Donate**: Connect Valora wallet, send CELO
3. **Verify**: AI checks proof (mock service)
4. **Release**: Admin approves, funds released
5. **Reward**: NFT badge minted for donor

## 📱 Mobile Experience

- **Wallet Connect**: Seamless Valora integration
- **Touch Optimized**: Large buttons, smooth gestures
- **Offline Ready**: PWA capabilities
- **Fast Loading**: Optimized for mobile networks

## 🔮 Future Roadmap

- **Real AI Integration**: Replace mock with OpenAI/Claude
- **Multi-chain Support**: Ethereum, Polygon, BSC
- **Advanced Analytics**: Campaign performance metrics
- **Social Features**: Share campaigns, donor leaderboards
- **Mobile App**: Native iOS/Android apps

## 🤝 Contributing

This is a hackathon MVP. For production deployment:

1. Replace mock AI with real verification
2. Add comprehensive testing
3. Implement proper security measures
4. Add monitoring and analytics
5. Create deployment pipeline

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Submission

- **Demo Video**: 5-minute walkthrough
- **Live Demo**: Deployed on Alfajores testnet
- **Code Quality**: TypeScript, clean architecture
- **Innovation**: Novel approach to Web3 crowdfunding

---

**Built for the Celo ecosystem**
