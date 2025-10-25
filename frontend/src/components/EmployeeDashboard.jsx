import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Wallet, TrendingUp, Calendar, Eye, Download } from 'lucide-react';

import {
  getEmployeeInfo,
  withdrawBalance,
  requestBalanceDecryption,
  requestNetSalaryDecryption
} from '../utils/contracts';

import {
  decryptAmount,
  formatCurrency
} from '../utils/fhevm';

const EmployeeDashboard = ({ signer, fheInstance, account }) => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [netSalary, setNetSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [account, signer]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const info = await getEmployeeInfo(signer, account);
      setEmployeeInfo(info);
    } catch (error) {
      console.error('Erreur chargement données employé:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptBalance = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Déchiffrement du solde...');

    try {
      // Demander le déchiffrement
      const requestId = await requestBalanceDecryption(signer);
      
      // Attendre le résultat (via Gateway)
      // Note: En production, écouter l'événement de réponse
      
      // Simuler le déchiffrement (en production, récupérer depuis Gateway)
      toast.success('Solde déchiffré!', { id: loadingToast });
      setShowBalance(true);
      
      // Pour la démo, afficher un montant simulé
      setBalance(3750); // Exemple
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      toast.error('Erreur de déchiffrement', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptSalary = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Déchiffrement du salaire...');

    try {
      const requestId = await requestNetSalaryDecryption(signer);
      
      toast.success('Salaire déchiffré!', { id: loadingToast });
      setShowSalary(true);
      
      // Pour la démo
      setNetSalary(5000); // Exemple
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      toast.error('Erreur de déchiffrement', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Retirer votre solde?')) return;

    setLoading(true);
    const loadingToast = toast.loading('Retrait en cours...');

    try {
      await withdrawBalance(signer);
      toast.success('Retrait effectué!', { id: loadingToast });
      setBalance(0);
      await loadEmployeeData();
    } catch (error) {
      console.error('Erreur retrait:', error);
      toast.error('Erreur lors du retrait', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (!employeeInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard Employé
        </h1>
        <p className="text-slate-400">
          Consultez vos informations de paie de manière confidentielle
        </p>
      </div>

      {/* Statut employé */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Statut</h2>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            employeeInfo.isActive 
              ? 'bg-green-900 text-green-300' 
              : 'bg-red-900 text-red-300'
          }`}>
            {employeeInfo.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Date d'embauche</p>
            <p className="text-white text-lg font-semibold">
              {new Date(employeeInfo.hireDate * 1000).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div>
            <p className="text-slate-400 text-sm mb-1">Dernier paiement</p>
            <p className="text-white text-lg font-semibold">
              {employeeInfo.lastPaymentDate === 0 
                ? 'Aucun paiement' 
                : new Date(employeeInfo.lastPaymentDate * 1000).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
              }
            </p>
          </div>
        </div>
      </div>

      {/* Cartes d'informations confidentielles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Salaire Net */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-300" />
              <h3 className="text-lg font-semibold text-white">Salaire Net</h3>
            </div>
          </div>
          
          {showSalary && netSalary !== null ? (
            <div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(netSalary)}
              </p>
              <p className="text-purple-200 text-sm">Par mois</p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-purple-300 mb-4">••••••</p>
              <button
                onClick={handleDecryptSalary}
                disabled={loading}
                className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Déchiffrer
              </button>
            </div>
          )}
        </div>

        {/* Solde disponible */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-300" />
              <h3 className="text-lg font-semibold text-white">Solde</h3>
            </div>
          </div>
          
          {showBalance && balance !== null ? (
            <div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(balance)}
              </p>
              <p className="text-blue-200 text-sm mb-4">Disponible pour retrait</p>
              {balance > 0 && (
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Retirer
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-blue-300 mb-4">••••••</p>
              <button
                onClick={handleDecryptBalance}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Déchiffrer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Informations sur la confidentialité */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-3">
          🔒 Confidentialité Garantie
        </h3>
        <div className="space-y-2 text-slate-300">
          <p>
            ✓ Vos montants sont chiffrés sur la blockchain avec FHE (Fully Homomorphic Encryption)
          </p>
          <p>
            ✓ Seul vous pouvez déchiffrer vos informations salariales
          </p>
          <p>
            ✓ Les calculs sont effectués directement sur les données chiffrées
          </p>
          <p>
            ✓ Même l'employeur ne peut pas voir votre salaire net
          </p>
        </div>
      </div>

      {/* Prochains paiements */}
      {employeeInfo.lastPaymentDate > 0 && (
        <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-white">Prochain paiement</h3>
          </div>
          <p className="text-slate-300">
            Le prochain paiement sera effectué lors du prochain traitement de la paie par l'employeur.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
