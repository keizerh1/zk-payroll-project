import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, DollarSign, Calendar, Plus, TrendingUp } from 'lucide-react';

import {
  getEmployeeAddresses,
  getEmployeeInfo,
  getActiveEmployeeCount,
  addEmployee,
  updateEmployeeSalary,
  removeEmployee,
  depositFunds,
  processPayroll,
  getEventHistory
} from '../utils/contracts';

import {
  encryptAmount,
  encryptPercentage,
  calculateNetSalary,
  formatCurrency,
  validateSalaryAmount,
  validateTaxRate
} from '../utils/fhevm';

const EmployerDashboard = ({ signer, fheInstance, account }) => {
  const [employees, setEmployees] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [history, setHistory] = useState([]);

  // Formulaire d'ajout d'employé
  const [newEmployee, setNewEmployee] = useState({
    address: '',
    grossSalary: '',
    taxRate: ''
  });

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, [signer]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEmployees(),
        loadActiveCount(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const addresses = await getEmployeeAddresses(signer);
      const employeesData = await Promise.all(
        addresses.map(async (addr) => {
          const info = await getEmployeeInfo(signer, addr);
          return {
            address: addr,
            ...info
          };
        })
      );
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
    }
  };

  const loadActiveCount = async () => {
    try {
      const count = await getActiveEmployeeCount(signer);
      setActiveCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const events = await getEventHistory(signer);
      setHistory(events.slice(0, 10)); // Derniers 10 événements
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateSalaryAmount(parseFloat(newEmployee.grossSalary))) {
      toast.error('Salaire invalide');
      return;
    }
    if (!validateTaxRate(parseFloat(newEmployee.taxRate))) {
      toast.error('Taux d\'imposition invalide (0-100%)');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Ajout de l\'employé...');

    try {
      // Chiffrer les valeurs
      const encryptedSalary = await encryptAmount(parseFloat(newEmployee.grossSalary));
      const encryptedTaxRate = await encryptPercentage(parseFloat(newEmployee.taxRate));

      // Appeler le contrat
      await addEmployee(
        signer,
        newEmployee.address,
        encryptedSalary,
        encryptedTaxRate
      );

      toast.success('Employé ajouté avec succès!', { id: loadingToast });
      
      // Réinitialiser le formulaire
      setNewEmployee({ address: '', grossSalary: '', taxRate: '' });
      setShowAddModal(false);
      
      // Recharger les données
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur ajout employé:', error);
      toast.error('Erreur lors de l\'ajout', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDepositFunds = async () => {
    const amount = prompt('Montant à déposer (USDC):');
    if (!amount || isNaN(amount)) return;

    setLoading(true);
    const loadingToast = toast.loading('Dépôt en cours...');

    try {
      const encryptedAmount = await encryptAmount(parseFloat(amount));
      await depositFunds(signer, encryptedAmount);
      
      toast.success(`${amount} USDC déposés avec succès!`, { id: loadingToast });
      await loadHistory();
    } catch (error) {
      console.error('Erreur dépôt:', error);
      toast.error('Erreur lors du dépôt', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!window.confirm(`Traiter la paie pour ${activeCount} employé(s)?`)) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Traitement de la paie...');

    try {
      await processPayroll(signer);
      toast.success('Paie traitée avec succès!', { id: loadingToast });
      await loadHistory();
    } catch (error) {
      console.error('Erreur traitement paie:', error);
      toast.error('Erreur lors du traitement', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeAddress) => {
    if (!window.confirm('Désactiver cet employé?')) return;

    setLoading(true);
    const loadingToast = toast.loading('Désactivation...');

    try {
      await removeEmployee(signer, employeeAddress);
      toast.success('Employé désactivé', { id: loadingToast });
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur désactivation:', error);
      toast.error('Erreur lors de la désactivation', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard Employeur
        </h1>
        <p className="text-slate-400">
          Gérez vos employés et la paie de manière confidentielle
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Employés actifs</p>
              <p className="text-3xl font-bold text-white">{activeCount}</p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total employés</p>
              <p className="text-3xl font-bold text-white">{employees.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Événements</p>
              <p className="text-3xl font-bold text-white">{history.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un employé
        </button>

        <button
          onClick={handleDepositFunds}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Déposer des fonds
        </button>

        <button
          onClick={handleProcessPayroll}
          disabled={loading || activeCount === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Traiter la paie
        </button>
      </div>

      {/* Liste des employés */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 mb-8">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Employés</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date d'embauche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Dernier paiement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {employees.map((emp) => (
                <tr key={emp.address} className="hover:bg-slate-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {emp.address.slice(0, 6)}...{emp.address.slice(-4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      emp.isActive 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {emp.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {new Date(emp.hireDate * 1000).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {emp.lastPaymentDate === 0 
                      ? 'Jamais' 
                      : new Date(emp.lastPaymentDate * 1000).toLocaleDateString('fr-FR')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {emp.isActive && (
                      <button
                        onClick={() => handleRemoveEmployee(emp.address)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Désactiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'employé */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">Ajouter un employé</h3>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-slate-300 mb-2">
                  Adresse du wallet
                </label>
                <input
                  type="text"
                  value={newEmployee.address}
                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-slate-300 mb-2">
                  Salaire brut (USDC)
                </label>
                <input
                  type="number"
                  value={newEmployee.grossSalary}
                  onChange={(e) => setNewEmployee({...newEmployee, grossSalary: e.target.value})}
                  placeholder="5000"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-slate-300 mb-2">
                  Taux d'imposition (%)
                </label>
                <input
                  type="number"
                  value={newEmployee.taxRate}
                  onChange={(e) => setNewEmployee({...newEmployee, taxRate: e.target.value})}
                  placeholder="25"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {newEmployee.grossSalary && newEmployee.taxRate && (
                <div className="mb-6 p-4 bg-slate-900 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Salaire net estimé:</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(calculateNetSalary(
                      parseFloat(newEmployee.grossSalary),
                      parseFloat(newEmployee.taxRate)
                    ))}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
