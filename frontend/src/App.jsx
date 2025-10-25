import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import Navigation from './components/Navigation';
import EmployerDashboard from './components/EmployerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ConnectWallet from './components/ConnectWallet';

// Utils
import { initializeFHE, getFHEInstance, resetFHEInstance } from './utils/fhevm';
import { getPayrollContract, getTokenContract } from './utils/contracts';

// Styles
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [fheInstance, setFheInstance] = useState(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);

  // Initialisation au chargement
  useEffect(() => {
    checkConnection();
  }, []);

  // Vérifier si le wallet est déjà connecté
  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de connexion:', error);
      }
    }
  };

  // Connexion du wallet avec gestion améliorée des erreurs
  const connectWallet = async () => {
    // Empêcher les connexions multiples
    if (isConnecting) {
      console.warn('⚠️ Connexion déjà en cours');
      return;
    }

    if (typeof window.ethereum === 'undefined') {
      toast.error('Veuillez installer MetaMask!');
      return;
    }

    try {
      setIsConnecting(true);
      setLoading(true);
      
      // Vérifier si déjà connecté
      const existingAccounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      let accounts;
      if (existingAccounts.length === 0) {
        // Demander la connexion uniquement si pas déjà connecté
        toast.loading('Demande de connexion à MetaMask...');
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        toast.dismiss();
      } else {
        accounts = existingAccounts;
      }

      // Créer le provider et le signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(userAccount);

      // Vérifier le réseau
      const network = await web3Provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log('📡 Connecté au réseau chainId:', chainId);

      // Initialiser FHE avec gestion d'erreur améliorée
      try {
        toast.loading('Initialisation du chiffrement FHE...');
        const fhe = await initializeFHE(web3Provider);
        setFheInstance(fhe);
        toast.dismiss();
        console.log('✅ FHE initialisé avec succès');
      } catch (fheError) {
        console.error('❌ Erreur FHE:', fheError);
        toast.dismiss();
        
        // Message d'erreur spécifique selon le type d'erreur
        if (fheError.message.includes('Failed to fetch')) {
          toast.error('Impossible de contacter le serveur Zama. Vérifiez votre connexion internet.', {
            duration: 6000
          });
        } else if (fheError.message.includes('public key')) {
          toast.error('Impossible d\'obtenir la clé publique FHE. Vérifiez que vous êtes sur le bon réseau.', {
            duration: 6000
          });
        } else {
          toast.error('Erreur lors de l\'initialisation FHE. Voir la console pour plus de détails.', {
            duration: 6000
          });
        }
        
        // Continuer sans FHE pour permettre la connexion basique
        console.warn('⚠️ Continuer sans FHE');
      }

      // Vérifier le rôle de l'utilisateur
      try {
        await checkUserRole(userAccount, web3Signer);
      } catch (roleError) {
        console.error('Erreur lors de la vérification du rôle:', roleError);
        toast.error('Impossible de vérifier votre rôle dans le système');
      }

      setNetworkReady(true);
      toast.success(`Connecté: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`);
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.dismiss();
      
      // Gestion spécifique des erreurs MetaMask
      if (error.code === 4001) {
        toast.error('Connexion refusée par l\'utilisateur');
      } else if (error.code === -32002) {
        toast.error('Demande de connexion déjà en attente dans MetaMask. Vérifiez votre extension.');
      } else if (error.message?.includes('already pending')) {
        toast.error('Une demande est déjà en attente. Vérifiez MetaMask.');
      } else {
        toast.error('Erreur de connexion au wallet. Voir la console.');
      }
      
      // Réinitialiser l'état en cas d'erreur
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setFheInstance(null);
      
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Vérifier le rôle de l'utilisateur
  const checkUserRole = async (userAccount, signer) => {
    try {
      const payroll = getPayrollContract(signer);
      
      // Vérifier si c'est l'employeur
      const employerAddress = await payroll.employer();
      const isEmployerCheck = employerAddress.toLowerCase() === userAccount.toLowerCase();
      setIsEmployer(isEmployerCheck);

      // Vérifier si c'est un employé
      try {
        const employeeInfo = await payroll.getEmployeeInfo(userAccount);
        setIsEmployee(employeeInfo.isActive);
      } catch (error) {
        // Pas un employé
        setIsEmployee(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      throw error;
    }
  };

  // Déconnexion
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setFheInstance(null);
    setIsEmployer(false);
    setIsEmployee(false);
    setNetworkReady(false);
    resetFHEInstance();
    toast.success('Déconnecté');
  };

  // Écouter les changements de compte et de réseau
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        console.log('🔄 Changement de compte détecté');
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Reconnecter avec le nouveau compte
          disconnectWallet();
          setTimeout(() => connectWallet(), 500);
        }
      };

      const handleChainChanged = (chainId) => {
        console.log('🔄 Changement de réseau détecté:', chainId);
        // Recharger la page pour réinitialiser l'état
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Navigation 
            account={account}
            isEmployer={isEmployer}
            isEmployee={isEmployee}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />

          <main className="container mx-auto px-4 py-8">
            {!account ? (
              <ConnectWallet onConnect={connectWallet} loading={loading} />
            ) : (
              <Routes>
                <Route 
                  path="/employer" 
                  element={
                    isEmployer ? (
                      <EmployerDashboard 
                        signer={signer}
                        fheInstance={fheInstance}
                        account={account}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />
                <Route 
                  path="/employee" 
                  element={
                    isEmployee ? (
                      <EmployeeDashboard 
                        signer={signer}
                        fheInstance={fheInstance}
                        account={account}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />
                <Route 
                  path="/" 
                  element={
                    <div className="text-center py-20">
                      <h1 className="text-4xl font-bold text-white mb-4">
                        🔐 ZK-Payroll
                      </h1>
                      <p className="text-xl text-slate-300 mb-8">
                        Système de paie confidentiel sur blockchain avec FHE
                      </p>
                      
                      {/* Message d'avertissement si FHE non initialisé */}
                      {!fheInstance && account && (
                        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 max-w-md mx-auto mb-6">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ Le chiffrement FHE n'est pas disponible. 
                            Certaines fonctionnalités peuvent être limitées.
                          </p>
                        </div>
                      )}

                      {isEmployer && (
                        <a 
                          href="/employer"
                          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Accéder au Dashboard Employeur
                        </a>
                      )}
                      {isEmployee && !isEmployer && (
                        <a 
                          href="/employee"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Accéder au Dashboard Employé
                        </a>
                      )}
                      {!isEmployer && !isEmployee && (
                        <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
                          <p className="text-slate-300">
                            Vous n'êtes ni employeur ni employé dans ce système.
                          </p>
                          <p className="text-slate-400 text-sm mt-4">
                            Adresse connectée: {account?.slice(0, 6)}...{account?.slice(-4)}
                          </p>
                        </div>
                      )}
                    </div>
                  } 
                />
              </Routes>
            )}
          </main>

          <footer className="text-center py-8 text-slate-400">
            <p>Propulsé par Zama FHE • Blockchain Confidentielle</p>
            {account && (
              <p className="text-xs mt-2">
                Connecté: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            )}
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
