import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useTradingContext, TradeData } from '../context/TradingContext';
import { NewTradeData } from '../context/TradingContext';
import CloseTradeModal from '../components/CloseTradeModal';

const OperationField: React.FC<{
    label: string;
    value?: string | number;
    isInput?: boolean;
    inputValue?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    formatCurrency: (value: string | number | undefined) => string;
}> = ({ label, value, isInput = false, inputValue, onChange, name, formatCurrency }) => (
    <div>
        <label htmlFor={isInput ? name : undefined} className="block text-sm font-medium text-text-secondary">{label}</label>
        {isInput ? (
            <input 
                type="text" 
                id={name}
                name={name}
                value={inputValue}
                onChange={onChange}
                className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text font-mono focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
        ) : (
            <p className="mt-1 block w-full bg-button border border-transparent rounded-md py-2 px-3 text-text font-mono">
                {value ? formatCurrency(value) : 'N/A'}
            </p>
        )}
    </div>
);

const RiskManagement: React.FC = () => {
    const { 
        updateLatestData, 
        addTradeToHistory, 
        showAlert, 
        tradingHistory, 
        closeTrade,
        accumulatedBalance,
        initialCapital: contextInitialCapital
    } = useTradingContext();

    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        capitalInicial: contextInitialCapital || '10000',
        riesgo: '2',
        fluctuacion: '4',
        feeCompra: '0.1',
        feeVenta: '0.1',
    });
    const [ordenLimit, setOrdenLimit] = useState('');
    const [selectedPair, setSelectedPair] = useState('');
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [tradeToClose, setTradeToClose] = useState<TradeData | null>(null);

    const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'ADA/USDT'];
    
    const closedTradesCount = useMemo(() => tradingHistory.filter(t => t.status === 'closed').length, [tradingHistory]);
    
    const effectiveCapital = useMemo(() => 
        closedTradesCount > 0 ? accumulatedBalance : parseFloat(inputs.capitalInicial) || 0,
        [closedTradesCount, accumulatedBalance, inputs.capitalInicial]
    );

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
             setInputs(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleOrdenLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
            setOrdenLimit(value);
        }
    };

    const calculatedData = useMemo(() => {
        const capital = effectiveCapital;
        const riesgo = parseFloat(inputs.riesgo) || 0;
        const fluctuacion = parseFloat(inputs.fluctuacion) || 0;
        const ordenLimitValue = parseFloat(ordenLimit) || 0;

        if (capital === 0 || riesgo === 0 || fluctuacion === 0) return {};
        
        const inversion = capital / (fluctuacion / riesgo);
        const udr = capital * (riesgo / 100);
        
        const fluctuacionAmount = ordenLimitValue * (fluctuacion / 100);
        
        const stopLossPrice = ordenLimitValue - fluctuacionAmount;
        const profitPrice1 = ordenLimitValue + fluctuacionAmount;
        const profitPrice2 = ordenLimitValue + (2 * fluctuacionAmount);
        const profitPrice3 = ordenLimitValue + (3 * fluctuacionAmount);

        const inversionFluctuationAmount = inversion * (fluctuacion / 100);
        const profitOB1 = inversion + inversionFluctuationAmount;
        const profitOB2 = inversion + (2 * inversionFluctuationAmount);
        const profitOB3 = inversion + (3 * inversionFluctuationAmount);
        
        return {
            inversion: inversion.toFixed(2),
            udr: udr.toFixed(2),
            profitOB1: profitOB1.toFixed(2),
            profitOB2: profitOB2.toFixed(2),
            profitOB3: profitOB3.toFixed(2),
            profit1: profitPrice1.toFixed(2),
            profit2: profitPrice2.toFixed(2),
            profit3: profitPrice3.toFixed(2),
            stopLoss: stopLossPrice.toFixed(2),
        };
    }, [inputs, ordenLimit, effectiveCapital]);
    
    useEffect(() => {
        updateLatestData({
            ...calculatedData,
            capitalInicial: inputs.capitalInicial,
            riesgo: inputs.riesgo,
            fluctuacion: inputs.fluctuacion,
            ordenLimit: ordenLimit,
        });
    }, [calculatedData, inputs, ordenLimit, updateLatestData]);

    const handleRegisterTrade = () => {
        if (!selectedPair) {
            showAlert('Por favor, selecciona un par.', 'error');
            return;
        }
        if (!ordenLimit || parseFloat(ordenLimit) <= 0) {
            showAlert('Por favor, introduce un precio de entrada válido.', 'error');
            return;
        }

        const newTrade: NewTradeData = {
            ...calculatedData,
            capitalInicial: inputs.capitalInicial,
            riesgo: inputs.riesgo,
            fluctuacion: inputs.fluctuacion,
            ordenLimit: ordenLimit,
            par: selectedPair,
        };
        const addedTrade = addTradeToHistory(newTrade);
        showAlert('Operación registrada exitosamente', 'success');
        navigate('/dashboard', { state: { newTradeTimestamp: addedTrade.timestamp } });
    };

    const handleOpenCloseModal = () => {
        const lastOpenTrade = tradingHistory.find(trade => trade.status === 'open');
        if (lastOpenTrade) {
            setTradeToClose(lastOpenTrade);
            setIsCloseModalOpen(true);
        } else {
            showAlert('No hay operaciones abiertas para cerrar.', 'error');
        }
    };

    const handleConfirmClose = (timestamp: string, profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => {
        closeTrade(timestamp, profitLevel);
        setIsCloseModalOpen(false);
        setTradeToClose(null);
    };

    const formatCurrency = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '$0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    }

    const inputFields = [
        { name: 'riesgo', label: 'Riesgo', unit: '(%)' },
        { name: 'fluctuacion', label: 'Fluctuación', unit: '(%)' },
    ];
    
    const latestOpenTrade = useMemo(() => tradingHistory.find(t => t.status === 'open'), [tradingHistory]);

    return (
        <div className="space-y-6">
             {isCloseModalOpen && tradeToClose && (
                <CloseTradeModal 
                    trade={tradeToClose}
                    onClose={() => setIsCloseModalOpen(false)}
                    onConfirmClose={handleConfirmClose}
                />
            )}
            <h1 className="text-3xl font-bold text-text">SISTEMA GESTION UDR</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                    <h2 className="text-lg font-semibold text-text">Gestión de Riesgo</h2>
                    <div>
                        <label htmlFor="capitalInicial" className="block text-sm font-medium text-text-secondary">Capital (Inicial) ($)</label>
                        <input 
                            type="text" 
                            id="capitalInicial" 
                            name="capitalInicial" 
                            value={inputs.capitalInicial} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={closedTradesCount > 0} // Disable after first trade is closed
                        />
                    </div>
                     {closedTradesCount > 0 && (
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-300">Capital Efectivo para Operar</h3>
                            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(effectiveCapital)}</p>
                        </div>
                    )}
                    {inputFields.map(({ name, label, unit }) => (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{`${label} ${unit}`}</label>
                            <input 
                                type="text" 
                                id={name} 
                                name={name} 
                                value={inputs[name as keyof typeof inputs]} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    ))}
                    <div className="bg-blue-900/50 border border-order-limit p-4 rounded-lg text-center mt-4">
                        <h3 className="text-sm font-medium text-blue-300">INVERSIÓN POR OPERACIÓN</h3>
                        <p className="text-4xl font-bold text-white mt-1">{formatCurrency(calculatedData.inversion)}</p>
                    </div>
                     <div className="bg-red-900/50 border border-stop-loss p-4 rounded-lg text-center mt-4">
                        <h3 className="text-sm font-medium text-red-300">UNIDAD DE RIESGO (UDR)</h3>
                        <p className="text-4xl font-bold text-white mt-1">{formatCurrency(calculatedData.udr)}</p>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                    <h2 className="text-lg font-semibold text-text">Plan de Trading y Registro</h2>
                     <div>
                        <label htmlFor="cryptoPair" className="block text-sm font-medium text-text-secondary">Par</label>
                        <select
                            id="cryptoPair"
                            value={selectedPair}
                            onChange={(e) => setSelectedPair(e.target.value)}
                            className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled>Selecciona un par</option>
                            {cryptoPairs.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                        </select>
                    </div>
                    <OperationField 
                        label="Precio de Entrada (OL)" 
                        isInput={true}
                        name="ordenLimit"
                        inputValue={ordenLimit}
                        onChange={handleOrdenLimitChange}
                        formatCurrency={formatCurrency}
                    />
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="bg-stop-loss/20 p-2 rounded">
                            <p className="text-red-300 font-semibold">Stop Loss (SL)</p>
                            <p className="font-mono">{formatCurrency(calculatedData.stopLoss)}</p>
                        </div>
                        <div className="bg-profit-target/20 p-2 rounded">
                            <p className="text-yellow-300 font-semibold">Profit (OB1)</p>
                            <p className="font-mono">{formatCurrency(calculatedData.profit1)}</p>
                        </div>
                    </div>
                     <div className="pt-2 space-y-2">
                        <button
                            onClick={handleRegisterTrade}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg text-base"
                        >
                            Registrar Operación
                        </button>
                        <button
                            onClick={handleOpenCloseModal}
                            disabled={!latestOpenTrade}
                            className="w-full bg-button hover:bg-button-hover text-text font-bold py-3 px-4 rounded-lg transition-colors shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cerrar Última Operación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskManagement;