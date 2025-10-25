// frontend/src/utils/fhevm.js
import { createInstance } from 'fhevmjs';

let fheInstance = null;

/**
 * Obtient l'URL de la gateway FHE selon le réseau
 */
function getGatewayUrl(chainId) {
  const gateways = {
    // Sepolia (Zama Protocol Testnet)
    11155111: 'https://gateway.zama.ai',
    // Local development
    31337: 'http://localhost:8545',
  };
  
  return gateways[chainId] || 'https://gateway.zama.ai';
}
/**
 * Obtient la clé publique du réseau FHE
 */
async function getPublicKey(chainId) {
  const gatewayUrl = getGatewayUrl(chainId);
  
  try {
    // Pour le devnet Zama (chainId 8009)
    if (chainId === 8009) {
      const response = await fetch(`${gatewayUrl}/public-key`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.publicKey;
    }
    
    // Pour les autres réseaux
    const response = await fetch(`${gatewayUrl}/public-key`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la clé publique:', error);
    
    // Fallback: utiliser une clé publique mock pour le développement local
    if (chainId === 31337) {
      console.warn('⚠️ Utilisation d\'une clé publique mock pour le développement local');
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    
    throw new Error(`Impossible de récupérer la clé publique pour chainId ${chainId}: ${error.message}`);
  }
}

/**
 * Initialise l'instance FHE avec le provider
 */
export async function initializeFHE(provider) {
  if (fheInstance) {
    console.log('✅ Instance FHE déjà initialisée');
    return fheInstance;
  }

  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log('🔄 Initialisation FHE pour chainId:', chainId);
    
    // Obtenir la clé publique
    const publicKey = await getPublicKey(chainId);
    console.log('✅ Clé publique récupérée');
    
    // Créer l'instance FHE
    fheInstance = await createInstance({
      chainId,
      publicKey,
      gatewayUrl: getGatewayUrl(chainId),
    });

    console.log('✅ Instance FHE initialisée avec succès');
    return fheInstance;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation FHE:', error);
    fheInstance = null;
    throw error;
  }
}

/**
 * Obtient l'instance FHE (doit être initialisée d'abord)
 */
export function getFHEInstance() {
  if (!fheInstance) {
    throw new Error('FHE non initialisé. Appelez initializeFHE() d\'abord.');
  }
  return fheInstance;
}

/**
 * Réinitialise l'instance FHE (utile pour les changements de réseau)
 */
export function resetFHEInstance() {
  fheInstance = null;
  console.log('🔄 Instance FHE réinitialisée');
}

/**
 * Chiffre un nombre avec FHE
 */
export async function encryptValue(value) {
  const instance = getFHEInstance();
  
  try {
    const valueUint64 = BigInt(Math.floor(value));
    const encrypted = await instance.encrypt64(valueUint64);
    
    return {
      data: encrypted,
      proof: await instance.generateProof(encrypted)
    };
  } catch (error) {
    console.error('❌ Erreur de chiffrement:', error);
    throw error;
  }
}

/**
 * Déchiffre une valeur FHE
 */
export async function decryptValue(encryptedValue, signer) {
  const instance = getFHEInstance();
  
  try {
    const message = 'Authorize decryption';
    const signature = await signer.signMessage(message);
    const decrypted = await instance.decrypt(encryptedValue, signature);
    
    return Number(decrypted);
  } catch (error) {
    console.error('❌ Erreur de déchiffrement:', error);
    throw error;
  }
}

/**
 * Chiffre un montant en dollars (avec décimales)
 */
export async function encryptAmount(amount, decimals = 6) {
  const amountInUnits = Math.floor(amount * Math.pow(10, decimals));
  return await encryptValue(amountInUnits);
}

/**
 * Déchiffre un montant et le convertit en dollars
 */
export async function decryptAmount(encryptedAmount, signer, decimals = 6) {
  const amountInUnits = await decryptValue(encryptedAmount, signer);
  return amountInUnits / Math.pow(10, decimals);
}

/**
 * Chiffre un pourcentage (ex: 25% -> 2500)
 */
export async function encryptPercentage(percentage) {
  const percentageValue = Math.floor(percentage * 100);
  return await encryptValue(percentageValue);
}

/**
 * Déchiffre un pourcentage
 */
export async function decryptPercentage(encryptedPercentage, signer) {
  const percentageValue = await decryptValue(encryptedPercentage, signer);
  return percentageValue / 100;
}

/**
 * Calcule le salaire net à partir du brut et du taux
 */
export function calculateNetSalary(grossSalary, taxRate) {
  const taxAmount = (grossSalary * taxRate) / 100;
  return grossSalary - taxAmount;
}

/**
 * Formate un montant en devise
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Valide un montant de salaire
 */
export function validateSalaryAmount(amount) {
  return amount > 0 && amount <= 1000000 && !isNaN(amount);
}

/**
 * Valide un taux d'imposition
 */
export function validateTaxRate(rate) {
  return rate >= 0 && rate <= 100 && !isNaN(rate);
}
