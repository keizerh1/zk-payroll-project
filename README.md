# 🔐 ZK-Payroll - Système de Paie Confidentielle sur Blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHE-purple)](https://www.zama.ai/)

**ZK-Payroll** est un système de gestion de paie décentralisé qui utilise le **Fully Homomorphic Encryption (FHE)** de Zama pour garantir la confidentialité totale des salaires et montants sur la blockchain.

## 🎯 Objectifs du Projet

- ✅ Permettre à une entreprise Web3 de verser des salaires sur blockchain
- ✅ **Jamais révéler les montants** grâce au chiffrement FHE
- ✅ Effectuer des calculs (salaires, taxes, commissions) sur des valeurs chiffrées
- ✅ Confidentialité de bout en bout avec contrôle d'accès granulaire

## 🏗️ Architecture

### Acteurs

1. **Employeur**: Dépose des fonds et gère les salaires
2. **Collaborateurs**: Reçoivent leur paie de manière confidentielle
3. **Smart Contract**: Gère les calculs FHE et les transferts

### Technologies

- **Blockchain**: Ethereum (compatible EVM)
- **Chiffrement**: Zama FHEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity 0.8.20
- **Frontend**: React 18 + Vite
- **Web3**: Ethers.js 6
- **SDK FHE**: fhevmjs

## 📁 Structure du Projet

```
zk-payroll/
├── contracts/                  # Smart contracts Solidity
│   ├── ZKPayroll.sol          # Contrat principal de paie
│   └── ConfidentialERC20.sol  # Token ERC20 confidentiel
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── utils/            # Utilitaires (FHE, contracts)
│   │   └── App.jsx           # Application principale
│   └── package.json
├── scripts/                    # Scripts de déploiement
│   └── deploy.js
├── tests/                      # Tests unitaires
│   └── ZKPayroll.test.js
├── docs/                       # Documentation
├── hardhat.config.js          # Configuration Hardhat
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- MetaMask ou wallet compatible
- Accès au testnet Zama

### Installation des dépendances

```bash
# Cloner le repository
git clone https://github.com/votre-org/zk-payroll.git
cd zk-payroll

# Installer les dépendances backend
npm install

# Installer les dépendances frontend
cd frontend
npm install
cd ..
```

### Configuration

1. Créer un fichier `.env` à la racine:

```env
# Clés privées (NE JAMAIS COMMITER)
PRIVATE_KEY=votre_clé_privée

# RPC URLs
ZAMA_RPC_URL=https://devnet.zama.ai
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/VOTRE_KEY

# Etherscan
ETHERSCAN_API_KEY=votre_api_key

# Adresses des contrats (après déploiement)
REACT_APP_PAYROLL_ADDRESS=0x...
REACT_APP_TOKEN_ADDRESS=0x...
```

2. Créer un fichier `.env` dans `/frontend`:

```env
REACT_APP_PAYROLL_ADDRESS=0x...
REACT_APP_TOKEN_ADDRESS=0x...
```

## 📝 Compilation et Déploiement

### Compiler les contrats

```bash
npx hardhat compile
```

### Déployer sur le testnet

```bash
npx hardhat run scripts/deploy.js --network zamaTestnet
```

Les adresses des contrats déployés seront sauvegardées dans `/deployments/`.

### Lancer les tests

```bash
npx hardhat test
```

## 🖥️ Utilisation

### Lancer l'application frontend

```bash
cd frontend
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Fonctionnalités Employeur

1. **Connexion** avec MetaMask
2. **Ajouter des employés** avec salaire brut et taux d'imposition (chiffrés)
3. **Déposer des fonds** dans le contrat
4. **Traiter la paie** pour tous les employés actifs
5. **Gérer les employés** (modifier, désactiver)

### Fonctionnalités Employé

1. **Connexion** avec MetaMask
2. **Voir son statut** et dates importantes
3. **Déchiffrer son salaire net** (visible uniquement par l'employé)
4. **Déchiffrer son solde** disponible
5. **Retirer son solde**

## 🔒 Sécurité et Confidentialité

### Chiffrement FHE

Toutes les valeurs sensibles sont chiffrées avec FHE:

```javascript
// Côté frontend - Chiffrement
const encryptedSalary = await encryptAmount(5000); // $5000
const encryptedTaxRate = await encryptPercentage(25); // 25%

// Côté smart contract - Calculs FHE
euint64 taxAmount = FHE.div(FHE.mul(grossSalary, taxRate), FHE.asEuint64(10000));
euint64 netSalary = FHE.sub(grossSalary, taxAmount);
```

### Permissions de Déchiffrement

Le contrat définit précisément qui peut déchiffrer quoi:

- ✅ **Employeur**: Peut connaître le brut versé et les charges globales
- ❌ **Employeur**: NE PEUT PAS voir les salaires nets individuels
- ✅ **Employé**: Peut voir son propre salaire et solde
- ❌ **Employé**: NE PEUT PAS voir les salaires des autres

## 📊 Cas d'Usage

### 1. Paie Mensuelle

```javascript
// L'employeur traite la paie
await processPayroll(signer);

// Les employés reçoivent automatiquement leur salaire net (chiffré)
// dans leur solde
```

### 2. Conformité Réglementaire

Le système peut s'intégrer avec des modules KYC/AML pour:
- Vérifier l'identité des destinataires
- Respecter les règles fiscales locales
- Sans révéler d'informations sensibles

### 3. Audit Transparent

Les auditeurs peuvent:
- Vérifier que les calculs sont corrects
- Confirmer que les paiements ont été effectués
- Sans accéder aux montants individuels

## 🧪 Tests

### Exécuter tous les tests

```bash
npx hardhat test
```

### Tests disponibles

- ✅ Ajout d'employés
- ✅ Mise à jour des salaires
- ✅ Traitement de la paie
- ✅ Retrait de solde
- ✅ Permissions de déchiffrement
- ✅ Gestion des erreurs

### Coverage

```bash
npx hardhat coverage
```

## 🎥 Démonstration

### Vidéo de présentation

[Lien vers la vidéo de démo]

### Screenshots

#### Dashboard Employeur
![Dashboard Employeur](docs/screenshots/employer-dashboard.png)

#### Dashboard Employé
![Dashboard Employé](docs/screenshots/employee-dashboard.png)

## 🛣️ Roadmap

### Phase 1 - MVP ✅
- [x] Smart contracts de base
- [x] Interface employeur
- [x] Interface employé
- [x] Chiffrement FHE basique

### Phase 2 - Améliorations 🚧
- [ ] Support multi-tokens
- [ ] Historique détaillé
- [ ] Notifications
- [ ] Mobile responsive

### Phase 3 - Fonctionnalités Avancées 📋
- [ ] Intégration KYC/AML
- [ ] Paiements récurrents automatiques
- [ ] Multi-signatures
- [ ] Rapports fiscaux

## 📚 Documentation Technique

### Architecture FHE

Le système utilise trois types de chiffrement:

1. **euint64**: Entiers 64 bits chiffrés pour les montants
2. **ebool**: Booléens chiffrés pour les comparaisons
3. **Gateway**: Système de déchiffrement sécurisé

### Flux de Données

```
1. Employeur saisit salaire → Chiffrement local (SDK FHE)
2. Envoi au smart contract → euint64 (chiffré)
3. Calculs FHE → Net = Brut - (Brut × Taux)
4. Stockage on-chain → Toujours chiffré
5. Employé demande déchiffrement → Gateway Zama
6. Signature validée → Valeur déchiffrée
```

## 🤝 Contribution

Les contributions sont les bienvenues!

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Zama** pour la technologie FHE révolutionnaire
- **Ethereum** pour la plateforme blockchain
- La communauté Web3 pour l'inspiration

## 📞 Contact

- **Email**: contact@zk-payroll.io
- **Twitter**: [@ZKPayroll](https://twitter.com/zkpayroll)
- **Discord**: [Rejoindre le serveur](https://discord.gg/zkpayroll)

---

**⚠️ Note**: Ce projet est actuellement en phase de développement. Ne pas utiliser en production avec des fonds réels sans audit de sécurité complet.

Fait avec ❤️ et 🔐 par l'équipe ZK-Payroll
