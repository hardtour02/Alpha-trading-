import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useTradingContext } from '../context/TradingContext';
import { NewTradeData } from '../context/TradingContext';

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
    const { updateLatestData, addTradeToHistory, showAlert } = useTradingContext();
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        capitalInicial: '10000',
        riesgo: '2',
        fluctuacion: '4',
        feeCompra: '0.1',
        feeVenta: '0.1',
    });
    const [ordenLimit, setOrdenLimit] = useState('65000');

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
        const capitalInicial = parseFloat(inputs.capitalInicial) || 0;
        const riesgo = parseFloat(inputs.riesgo) || 0;
        const fluctuacion = parseFloat(inputs.fluctuacion) || 0;
        const feeCompra = parseFloat(inputs.feeCompra) || 0;
        const feeVenta = parseFloat(inputs.feeVenta) || 0;
        const ordenLimitValue = parseFloat(ordenLimit) || 0;

        const delta = fluctuacion / 2;
        const trailingStopPerc = fluctuacion;
        
        if (capitalInicial === 0 || riesgo === 0 || fluctuacion === 0) return {};
        
        const inversion = capitalInicial / (fluctuacion / riesgo);
        const udr = capitalInicial * (riesgo / 100);
        const udrAFavor = 100 / riesgo;
        const totalOperaciones = inversion > 0 ? capitalInicial / inversion : 0;
        
        const profitAmount = inversion * (fluctuacion / 100);
        const feeAmount = inversion * ((feeCompra + feeVenta) / 100);
        const capitalFinal = capitalInicial + profitAmount - feeAmount;
        const liquidez = capitalFinal;
        
        const fluctuacionAmount = ordenLimitValue * (fluctuacion / 100);
        
        const stopLossPrice = ordenLimitValue - fluctuacionAmount;
        const trailingStopPrice = ordenLimitValue - fluctuacionAmount;
        const profitPrice1 = ordenLimitValue + fluctuacionAmount;
        const profitPrice2 = ordenLimitValue + (2 * fluctuacionAmount);
        const profitPrice3 = ordenLimitValue + (3 * fluctuacionAmount);

        const inversionFluctuationAmount = inversion * (fluctuacion / 100);
        const profitOB1 = inversion + inversionFluctuationAmount;
        const profitOB2 = inversion + (2 * inversionFluctuationAmount);
        const profitOB3 = inversion + (3 * inversionFluctuationAmount);
        const sltProfit = inversion - inversionFluctuationAmount;
        
        return {
            inversion: inversion.toFixed(2),
            capitalFinal: capitalFinal.toFixed(2),
            liquidez: liquidez.toFixed(2),
            udr: udr.toFixed(2),
            udrAFavor: udrAFavor.toFixed(2),
            totalOperaciones: totalOperaciones.toFixed(2),
            relacion: `${fluctuacion}:${riesgo}`,
            delta: delta.toFixed(2),
            trailingStop: trailingStopPerc.toFixed(2),
            
            profitOB1: profitOB1.toFixed(2),
            profitOB2: profitOB2.toFixed(2),
            profitOB3: profitOB3.toFixed(2),
            sltProfit: sltProfit.toFixed(2),

            profit1: profitPrice1.toFixed(2),
            profit2: profitPrice2.toFixed(2),
            profit3: profitPrice3.toFixed(2),
            stopLoss: stopLossPrice.toFixed(2),
            stopLossTrailing: trailingStopPrice.toFixed(2),
        };
    }, [inputs, ordenLimit]);
    
    useEffect(() => {
        const fullData = {
            ...calculatedData,
            capitalInicial: inputs.capitalInicial,
            riesgo: inputs.riesgo,
            fluctuacion: inputs.fluctuacion,
            ordenLimit: ordenLimit,
        };
        updateLatestData(fullData);
    }, [calculatedData, inputs, ordenLimit, updateLatestData]);

    const handleRegisterTrade = () => {
        const tradeData: NewTradeData = {
            ...calculatedData,
            capitalInicial: inputs.capitalInicial,
            riesgo: inputs.riesgo,
            fluctuacion: inputs.fluctuacion,
            ordenLimit: ordenLimit,
        };
        const newTrade = addTradeToHistory(tradeData);
        showAlert('Operación registrada exitosamente');
        navigate('/dashboard', { state: { newTradeTimestamp: newTrade.timestamp } });
    };

    const formatCurrency = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '$0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    }

    const inputFields = [
        { name: 'capitalInicial', label: 'Capital (Inicial)', unit: '($)' },
        { name: 'riesgo', label: 'Riesgo', unit: '(%)' },
        { name: 'fluctuacion', label: 'Fluctuación', unit: '(%)' },
        { name: 'feeCompra', label: 'FEE (Compra)', unit: '(%)' },
        { name: 'feeVenta', label: 'FEE (Venta)', unit: '(%)' }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">SISTEMA GESTION UDR</h1>
            
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold text-text mb-4">Gestión TRADING</h2>
                    <div className="space-y-4">
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
                        <div className="pt-2">
                            <button
                                onClick={handleRegisterTrade}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
                            >
                                Registrar Operación
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold text-text mb-4">GESTION OPERACION</h2>
                    <div className="space-y-4">
                        <div className="bg-blue-900/50 border border-order-limit p-4 rounded-lg text-center">
                            <h3 className="text-sm font-medium text-blue-300">INVERSIÓN</h3>
                            <p className="text-4xl font-bold text-white mt-1">{formatCurrency(calculatedData.inversion)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card title="Capital (Final)" value={formatCurrency(calculatedData.capitalFinal)} />
                            <Card title="Liquidez" value={formatCurrency(calculatedData.liquidez)} />
                            <Card title="UDR" value={calculatedData.udr || '0.00'} />
                            <Card title="UDR a Favor" value={calculatedData.udrAFavor || 'N/A'} />
                            <Card title="Total Operaciones" value={calculatedData.totalOperaciones || 'N/A'} />
                            <Card title="Relación" value={calculatedData.relacion || '0:0'} />
                            <Card title="Trailing Stop (%)" value={calculatedData.trailingStop || '0.00'} />
                            <Card title="Delta (%)" value={calculatedData.delta || '0.00'} />
                        </div>
                    </div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold text-text mb-4">Profit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <Card title="Profit (OB1)" value={formatCurrency(calculatedData.profitOB1)} />
                         <Card title="Profit (OB2)" value={formatCurrency(calculatedData.profitOB2)} />
                         <Card title="Profit (OB3)" value={formatCurrency(calculatedData.profitOB3)} />
                         <Card title="Stop Loss Trailing (SLT)" value={formatCurrency(calculatedData.sltProfit)} />
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold text-text mb-4">TRADING</h2>
                    <div className="space-y-4">
                         <OperationField 
                            label="Orden Limit (OL)" 
                            isInput={true}
                            name="ordenLimit"
                            inputValue={ordenLimit}
                            onChange={handleOrdenLimitChange}
                            formatCurrency={formatCurrency}
                        />
                        <OperationField label="Profit (OB1)" value={calculatedData.profit1} formatCurrency={formatCurrency} />
                        <OperationField label="Profit (OB2)" value={calculatedData.profit2} formatCurrency={formatCurrency} />
                        <OperationField label="Profit (OB3)" value={calculatedData.profit3} formatCurrency={formatCurrency} />
                        <OperationField label="Stop Loss (SL)" value={calculatedData.stopLoss} formatCurrency={formatCurrency} />
                        <OperationField label="Stop Loss Trailing (SLT)" value={calculatedData.stopLossTrailing} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskManagement;