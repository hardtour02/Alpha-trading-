import React from 'react';
import { TradeData } from '../context/TradingContext';
import { CloseIcon } from './icons';

interface CloseTradeModalProps {
  trade: TradeData;
  onClose: () => void;
  onConfirmClose: (timestamp: string, profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => void;
}

const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
};

const CloseTradeModal: React.FC<CloseTradeModalProps> = ({ trade, onClose, onConfirmClose }) => {
  if (!trade.timestamp) return null;

  const profitLevels: { level: 'OB1' | 'OB2' | 'OB3'; value?: string; price?: string }[] = [
    { level: 'OB1', value: trade.profitOB1, price: trade.profit1 },
    { level: 'OB2', value: trade.profitOB2, price: trade.profit2 },
    { level: 'OB3', value: trade.profitOB3, price: trade.profit3 },
  ];

  const handleConfirm = (profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => {
    if (trade.timestamp) {
      onConfirmClose(trade.timestamp, profitLevel);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center"
    >
      <div 
        className="bg-card rounded-lg border border-border w-full max-w-md m-4 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text">Cerrar Operación</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            <CloseIcon /> 
          </button>
        </div>
        <p className="text-text-secondary mb-6">Selecciona el nivel alcanzado para cerrar la operación.</p>
        
        <div className="space-y-4">
          {profitLevels.map(({ level, value, price }) => (
            <div key={level} className="bg-button/50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-text">{level}</span>
                <p className="text-text-secondary text-sm">Precio: {formatCurrency(price)} | Ganancia: {formatCurrency(value ? parseFloat(value) - parseFloat(trade.inversion || '0') : 0)}</p>
              </div>
              <button 
                onClick={() => handleConfirm(level)}
                className="bg-buy-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cerrar Aquí
              </button>
            </div>
          ))}

          <div className="bg-button/50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-text">Stop Loss (SL)</span>
                <p className="text-text-secondary text-sm">Precio: {formatCurrency(trade.stopLoss)} | Pérdida: {formatCurrency(trade.udr)}</p>
              </div>
              <button 
                onClick={() => handleConfirm('SL')}
                className="bg-sell-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cerrar en SL
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CloseTradeModal;
