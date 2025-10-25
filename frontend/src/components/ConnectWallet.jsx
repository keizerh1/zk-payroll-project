import React from 'react';
import { Wallet, Lock, Shield, Eye } from 'lucide-react';

const ConnectWallet = ({ onConnect, loading }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="text-5xl font-bold text-white mb-4">
          ZK-Payroll
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          Système de paie confidentielle sur blockchain
        </p>

        <button
          onClick={onConnect}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 inline-flex items-center gap-3 mb-16"
        >
          <Wallet className="w-6 h-6" />
          {loading ? 'Connexion...' : 'Connecter votre Wallet'}
        </button>

        {/* Fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Chiffrement FHE
            </h3>
            <p className="text-slate-400">
              Tous les montants sont chiffrés avec Fully Homomorphic Encryption de Zama
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Confidentialité Totale
            </h3>
            <p className="text-slate-400">
              Seul vous pouvez déchiffrer vos informations salariales
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-center mb-4">
              <Eye className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Transparence Sélective
            </h3>
            <p className="text-slate-400">
              Contrôlez qui peut accéder à quelles informations
            </p>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-left">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Comment ça fonctionne?
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Connectez votre wallet
                </h4>
                <p className="text-slate-400">
                  Utilisez MetaMask ou un autre wallet compatible pour vous connecter
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Employeur: Gérez vos employés
                </h4>
                <p className="text-slate-400">
                  Ajoutez des employés, définissez leurs salaires (chiffrés), et traitez la paie
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Employé: Consultez vos informations
                </h4>
                <p className="text-slate-400">
                  Déchiffrez et consultez votre salaire et solde de manière confidentielle
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Tout reste privé
                </h4>
                <p className="text-slate-400">
                  Les montants restent chiffrés sur la blockchain, protégeant votre vie privée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note technique */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Propulsé par <span className="text-purple-400 font-semibold">Zama FHE</span> • 
            Blockchain confidentielle de nouvelle génération
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
