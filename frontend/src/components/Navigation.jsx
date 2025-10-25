import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';

const Navigation = ({ account, isEmployer, isEmployee, onConnect, onDisconnect }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl">🔐</div>
            <span className="text-xl font-bold text-white">ZK-Payroll</span>
          </Link>

          <div className="flex items-center gap-4">
            {account && (
              <>
                {isEmployer && (
                  <Link
                    to="/employer"
                    className="text-slate-300 hover:text-white transition-colors px-3 py-2"
                  >
                    Dashboard Employeur
                  </Link>
                )}
                {isEmployee && (
                  <Link
                    to="/employee"
                    className="text-slate-300 hover:text-white transition-colors px-3 py-2"
                  >
                    Dashboard Employé
                  </Link>
                )}
              </>
            )}

            {account ? (
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                  <span className="text-slate-300 text-sm">{formatAddress(account)}</span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connecter Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
