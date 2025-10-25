// frontend/src/config/networks.js

/**
 * Configuration des réseaux blockchain supportés
 */

export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 en hexadécimal
    chainIdDecimal: 11155111,
    chainName: 'Sepolia (Zama Protocol)',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SepoliaETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    gatewayUrl: 'https://gateway.zama.ai'
  }
};
  
  LOCALHOST: {
    chainId: '0x7A69', // 31337 en hexadécimal
    chainIdDecimal: 31337,
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
    gatewayUrl: 'http://localhost:8545'
  }
};

/**
 * Obtient la configuration du réseau actuel
 */
export function getCurrentNetwork(chainId) {
  const networks = Object.values(NETWORKS);
  return networks.find(n => n.chainIdDecimal === chainId) || null;
}

/**
 * Vérifie si un chainId est supporté
 */
export function isNetworkSupported(chainId) {
  return getCurrentNetwork(chainId) !== null;
}

/**
 * Change de réseau vers Zama Devnet
 */
export async function switchToZamaDevnet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask non installé');
  }

  try {
    // Essayer de changer vers le réseau
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.ZAMA_DEVNET.chainId }],
    });
    
    console.log('✅ Réseau changé vers Zama Devnet');
    return true;
    
  } catch (switchError) {
    // Si le réseau n'existe pas (code 4902), l'ajouter
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: NETWORKS.ZAMA_DEVNET.chainId,
            chainName: NETWORKS.ZAMA_DEVNET.chainName,
            nativeCurrency: NETWORKS.ZAMA_DEVNET.nativeCurrency,
            rpcUrls: NETWORKS.ZAMA_DEVNET.rpcUrls,
            blockExplorerUrls: NETWORKS.ZAMA_DEVNET.blockExplorerUrls,
          }],
        });
        
        console.log('✅ Réseau Zama Devnet ajouté et activé');
        return true;
        
      } catch (addError) {
        console.error('Erreur lors de l\'ajout du réseau:', addError);
        throw new Error('Impossible d\'ajouter le réseau Zama Devnet');
      }
    } else {
      // Autre erreur (ex: utilisateur a refusé)
      console.error('Erreur lors du changement de réseau:', switchError);
      throw switchError;
    }
  }
}

/**
 * Vérifie si l'utilisateur est sur le bon réseau
 */
export async function checkNetwork() {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(chainId, 16);
    const network = getCurrentNetwork(chainIdDecimal);
    
    return {
      chainId: chainIdDecimal,
      network,
      isSupported: network !== null,
      isZamaDevnet: chainIdDecimal === NETWORKS.ZAMA_DEVNET.chainIdDecimal
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du réseau:', error);
    return null;
  }
}

/**
 * Formate le nom du réseau pour l'affichage
 */
export function formatNetworkName(chainId) {
  const network = getCurrentNetwork(chainId);
  return network ? network.chainName : `Réseau inconnu (${chainId})`;
}

/**
 * Obtient l'URL de l'explorateur pour une transaction
 */
export function getExplorerUrl(chainId, txHash) {
  const network = getCurrentNetwork(chainId);
  if (!network || network.blockExplorerUrls.length === 0) {
    return null;
  }
  return `${network.blockExplorerUrls[0]}/tx/${txHash}`;
}

/**
 * Obtient l'URL de l'explorateur pour une adresse
 */
export function getAddressExplorerUrl(chainId, address) {
  const network = getCurrentNetwork(chainId);
  if (!network || network.blockExplorerUrls.length === 0) {
    return null;
  }
  return `${network.blockExplorerUrls[0]}/address/${address}`;
}
