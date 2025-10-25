# 🔐 ZK-Payroll - Confidential Blockchain Payroll System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Zama](https://img.shields.io/badge/Powered%20by-Zama-blue)](https://zama.ai)

A decentralized payroll management system using Zama's Fully Homomorphic Encryption (FHE) to ensure complete confidentiality of salaries and amounts on the blockchain.

## 🎯 Project Goals

- ✅ Enable Web3 companies to pay salaries on blockchain
- ✅ Never reveal amounts thanks to FHE encryption
- ✅ Perform calculations (salaries, taxes, commissions) on encrypted values
- ✅ End-to-end confidentiality with granular access control

## 🏗️ Architecture

### Key Actors
- **Employer**: Deposits funds and manages salaries
- **Employees**: Receive confidential payments
- **Smart Contract**: Handles FHE calculations and transfers

### Technology Stack
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: Zama FHEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity 0.8.20
- **Frontend**: React 18 + Vite
- **Web3**: Ethers.js 6
- **FHE SDK**: fhevmjs

## 📁 Project Structure

\\\
zk-payroll-project/
├── contracts/                  # Solidity smart contracts
│   ├── ZKPayroll.sol          # Main payroll contract
│   └── ConfidentialERC20.sol  # Confidential ERC20 token
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/            # Utilities (FHE, contracts)
│   │   └── App.jsx           # Main application
│   └── package.json
├── scripts/                    # Deployment scripts
│   └── deploy.js
├── tests/                      # Unit tests
│   └── ZKPayroll.test.js
└── hardhat.config.js          # Hardhat configuration
\\\

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Sepolia testnet ETH ([Get from faucet](https://www.alchemy.com/faucets/ethereum-sepolia))

### Installation

\\\ash
# Clone the repository
git clone https://github.com/keizerh1/zk-payroll-project.git
cd zk-payroll-project

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
\\\

### Configuration

Create \rontend/.env\:

\\\env
VITE_PAYROLL_CONTRACT_ADDRESS=0x...
VITE_TOKEN_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
VITE_GATEWAY_URL=https://gateway.zama.ai
\\\

### Running the Application

\\\ash
cd frontend
npm run dev
\\\

Access the application at **http://localhost:5173**

## 🔒 Security & Confidentiality

### FHE Encryption

All sensitive values are encrypted with FHE:

\\\javascript
// Frontend - Encryption
const encryptedSalary = await encryptAmount(5000); // \
const encryptedTaxRate = await encryptPercentage(25); // 25%
\\\

\\\solidity
// Smart Contract - FHE Computations
euint64 taxAmount = FHE.div(FHE.mul(grossSalary, taxRate), FHE.asEuint64(10000));
euint64 netSalary = FHE.sub(grossSalary, taxAmount);
\\\

### Decryption Permissions

- ✅ **Employer**: Can know gross amounts and total charges
- ❌ **Employer**: CANNOT see individual net salaries
- ✅ **Employee**: Can see their own salary and balance
- ❌ **Employee**: CANNOT see other employees' salaries

## 🎮 Features

### Employer Dashboard
- Connect with MetaMask
- Add employees with encrypted gross salary and tax rate
- Deposit funds into contract
- Process payroll for all active employees
- Manage employees (modify, deactivate)

### Employee Dashboard
- Connect with MetaMask
- View employment status and important dates
- Decrypt personal net salary (visible only to employee)
- Decrypt available balance
- Withdraw balance

## 📝 Smart Contract Deployment

### Compile Contracts
\\\ash
npx hardhat compile
\\\

### Deploy to Sepolia
\\\ash
npx hardhat run scripts/deploy.js --network sepolia
\\\

### Run Tests
\\\ash
npx hardhat test
\\\

## 🧪 Testing

Available tests:
- ✅ Add employees
- ✅ Update salaries
- ✅ Process payroll
- ✅ Withdraw balance
- ✅ Decryption permissions
- ✅ Error handling

\\\ash
# Run all tests
npx hardhat test

# Coverage report
npx hardhat coverage
\\\

## 🛣️ Roadmap

### Phase 1 - MVP ✅
- [x] Core smart contracts
- [x] Employer interface
- [x] Employee interface
- [x] Basic FHE encryption

### Phase 2 - Enhancements 🚧
- [ ] Multi-token support
- [ ] Detailed history
- [ ] Notifications
- [ ] Mobile responsive

### Phase 3 - Advanced Features 📋
- [ ] KYC/AML integration
- [ ] Automatic recurring payments
- [ ] Multi-signatures
- [ ] Tax reports

## 📚 Technical Documentation

### FHE Data Flow

1. **Employer enters salary** → Local encryption (FHE SDK)
2. **Send to smart contract** → euint64 (encrypted)
3. **FHE calculations** → Net = Gross - (Gross × Rate)
4. **On-chain storage** → Always encrypted
5. **Employee requests decryption** → Zama Gateway
6. **Signature validated** → Decrypted value

### Network Configuration

- **Testnet**: Ethereum Sepolia (Chain ID: 11155111)
- **FHE Gateway**: https://gateway.zama.ai
- **Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Explorer**: https://sepolia.etherscan.io

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create your feature branch (\git checkout -b feature/AmazingFeature\)
3. Commit your changes (\git commit -m 'Add AmazingFeature'\)
4. Push to the branch (\git push origin feature/AmazingFeature\)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai) for revolutionary FHE technology
- [Ethereum](https://ethereum.org) for the blockchain platform
- The Web3 community for inspiration

## 📞 Contact

- **GitHub**: [@keizerh1](https://github.com/keizerh1)
- **Project**: [zk-payroll-project](https://github.com/keizerh1/zk-payroll-project)

## ⚠️ Disclaimer

This project is currently in development phase. **Do not use in production with real funds without a complete security audit.**

---

Made with ❤️ and 🔐 by [@keizerh1](https://github.com/keizerh1)
