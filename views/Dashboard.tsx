import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { useTradingContext } from '../context/TradingContext';
import { TradeData } from '../context/TradingContext';

const Dashboard: React.FC = () => {
  const { latestCalculatedData, tradingHistory } = useTradingContext();

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  const historyHeaders: { key: keyof TradeData; label: string }[] = [
      { key: 'capitalInicial', label: 'Capital ($)'},
      { key: 'riesgo', label: 'Riesgo (%)'},
      { key: 'fluctuacion', label: 'Fluctuación (%)' },
      { key: 'inversion', label: 'Inversión ($)' },
      { key: 'ordenLimit', label: 'OL ($)' },
      { key: 'stopLoss', label: 'SL ($)' },
      { key: 'profit1', label: 'OB1 ($)' },
      { key: 'relacion', label: 'Relación' },
      { key: 'udr', label: 'UDR ($)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-text">Registro Trading</h1>
      </div>

      {/* Resumen Rápido de la última configuración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Capital (Configurado)" value={formatCurrency(latestCalculatedData.capitalInicial)} />
        <Card title="Liquidez (Estimada)" value={formatCurrency(latestCalculatedData.liquidez)} />
        <Card title="Total Operaciones" value={latestCalculatedData.totalOperaciones || 'N/A'} />
        <Card title="UDR" value={formatCurrency(latestCalculatedData.udr)} />
      </div>

      {/* Historial de Operaciones */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold text-text mb-4">Historial de Operaciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-border">
              <tr>
                <th className="p-3 text-sm font-semibold text-text-secondary">Fecha</th>
                 {historyHeaders.map(header => (
                  <th key={header.key} className="p-3 text-sm font-semibold text-text-secondary">{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tradingHistory.length === 0 ? (
                 <tr>
                    <td colSpan={historyHeaders.length + 2} className="text-center py-10">
                        <p className="text-text-secondary">No hay operaciones registradas.</p>
                        <p className="text-text-secondary mt-2">Ve a <Link to="/risk-management" className="text-blue-400 hover:underline">Gestión de Riesgo</Link> para planificar y registrar tu primera operación.</p>
                    </td>
                </tr>
              ) : (
                tradingHistory.map((trade) => (
                  <tr key={trade.timestamp} className="border-b border-border hover:bg-button/50">
                    <td className="p-3 text-text-secondary whitespace-nowrap">{formatDate(trade.timestamp)}</td>
                    {historyHeaders.map(header => (
                      <td key={header.key} className="p-3 text-text-secondary font-mono">
                        {header.label.includes('($)') ? formatCurrency(trade[header.key]) : trade[header.key] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
