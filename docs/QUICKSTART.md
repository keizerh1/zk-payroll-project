# 🚀 Guide de Démarrage Rapide - ZK-Payroll

Ce guide vous permettra de lancer le projet ZK-Payroll en moins de 10 minutes.

## Étape 1: Installation (2 min)

```bash
# Cloner le repository
git clone https://github.com/votre-org/zk-payroll.git
cd zk-payroll

# Installer les dépendances
npm install

# Installer les dépendances frontend
cd frontend
npm install
cd ..
```

## Étape 2: Configuration (2 min)

### Créer le fichier .env à la racine

```bash
cat > .env << 'EOF'
# Votre clé privée MetaMask (NE JAMAIS COMMITER!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
ZAMA_RPC_URL=https://devnet.zama.ai

# Adresses des contrats (à remplir après déploiement)
REACT_APP_PAYROLL_ADDRESS=
REACT_APP_TOKEN_ADDRESS=
EOF
```

### Créer le fichier .env pour le frontend

```bash
cat > frontend/.env << 'EOF'
REACT_APP_PAYROLL_ADDRESS=
REACT_APP_TOKEN_ADDRESS=
EOF
```

## Étape 3: Compilation et Tests (2 min)

```bash
# Compiler les smart contracts
npx hardhat compile

# Lancer les tests
npx hardhat test
```

Vous devriez voir tous les tests passer avec succès ✅

## Étape 4: Déploiement (2 min)

### Option A: Déploiement local (pour le développement)

```bash
# Dans un terminal, lancer un nœud local
npx hardhat node

# Dans un autre terminal, déployer
npx hardhat run scripts/deploy.js --network localhost
```

### Option B: Déploiement sur testnet Zama

```bash
npx hardhat run scripts/deploy.js --network zamaTestnet
```

**Important**: Après le déploiement, copiez les adresses des contrats affichées dans vos fichiers `.env`.

## Étape 5: Lancer l'Application (2 min)

```bash
# Mettre à jour les adresses dans frontend/.env
# Puis lancer le frontend
cd frontend
npm run dev
```

L'application sera accessible sur: `http://localhost:5173`

## Étape 6: Tester l'Application

### Configuration MetaMask

1. Ouvrez MetaMask
2. Ajoutez le réseau Zama testnet:
   - Nom: Zama Testnet
   - RPC URL: https://devnet.zama.ai
   - Chain ID: 8009
   - Symbole: ZAMA

3. Demandez des tokens de test sur le faucet Zama

### Scénario de Test Complet

#### En tant qu'Employeur:

1. **Connectez votre wallet** MetaMask
2. **Ajoutez un employé**:
   - Adresse: [Une autre adresse que vous contrôlez]
   - Salaire brut: 5000 USDC
   - Taux d'imposition: 25%
3. **Déposez des fonds**: 10000 USDC
4. **Traitez la paie**: Cliquez sur "Traiter la paie"

#### En tant qu'Employé:

1. **Changez de compte** dans MetaMask (utilisez l'adresse employé)
2. **Connectez-vous** à l'application
3. **Déchiffrez votre salaire net**: Devrait afficher 3750 USDC
4. **Déchiffrez votre solde**: Devrait afficher 3750 USDC
5. **Retirez votre solde** (optionnel)

## 🎯 Commandes Utiles

```bash
# Compiler les contrats
npm run compile

# Lancer les tests
npm run test

# Voir la couverture des tests
npm run test:coverage

# Nettoyer les artifacts
npm run clean

# Lancer le frontend
npm run frontend:dev

# Build du frontend pour production
npm run frontend:build
```

## 📊 Vérifier le Déploiement

Après le déploiement, vérifiez que tout fonctionne:

```bash
# Vérifier les adresses des contrats
cat deployments/deployment-*.json

# Tester l'accès au contrat
npx hardhat console --network zamaTestnet
```

Dans la console Hardhat:

```javascript
const ZKPayroll = await ethers.getContractFactory("ZKPayroll");
const payroll = await ZKPayroll.attach("ADRESSE_DU_CONTRAT");
const employer = await payroll.employer();
console.log("Employeur:", employer);
```

## 🐛 Dépannage

### Problème: "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Problème: "Invalid private key"

Vérifiez que votre clé privée dans `.env` est correcte et commence par `0x`.

### Problème: "Network not configured"

Vérifiez que le réseau Zama est bien configuré dans `hardhat.config.js` et MetaMask.

### Problème: "Transaction failed"

Assurez-vous d'avoir suffisamment de tokens de test sur votre compte.

## 📝 Prochaines Étapes

Maintenant que vous avez lancé le projet:

1. ✅ Explorez le code des smart contracts dans `/contracts`
2. ✅ Regardez les composants React dans `/frontend/src/components`
3. ✅ Testez les différents cas d'usage
4. ✅ Lisez la documentation complète dans `/docs`
5. ✅ Contribuez au projet!

## 🔐 Sécurité

**Important**: Ne jamais commiter votre `.env` avec votre clé privée!

Ajoutez `.env` à votre `.gitignore`:

```bash
echo ".env" >> .gitignore
echo "frontend/.env" >> .gitignore
```

## 💡 Conseils

- Utilisez toujours des comptes de test pour le développement
- Gardez vos clés privées sécurisées
- Testez tous les cas d'usage avant de déployer en production
- Faites un audit de sécurité complet avant utilisation réelle

## 📞 Besoin d'aide?

- 📖 Consultez le [README complet](README.md)
- 💬 Rejoignez notre [Discord](https://discord.gg/zkpayroll)
- 🐦 Suivez-nous sur [Twitter](https://twitter.com/zkpayroll)
- 📧 Email: contact@zk-payroll.io

---

**Bon développement! 🚀**
