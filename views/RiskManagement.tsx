import React, { useState, useMemo, ChangeEvent } from 'react';
import Card from '../components/Card';
import TradingViewWidget from '../components/TradingViewWidget';

// A mock price for calculations, as we cannot get real-time data from the widget.
// The user can see the live price on the TradingView chart for comparison.
const MOCK_CURRENT_PRICE = 65000;

const RiskManagement: React.FC = () => {
    const [inputs, setInputs] = useState({
        riesgo: '2',
        fluctuacion: '4',
        fee: '0.1',
        capitalInicial: '10000',
        trailingStop: '1.5',
    });
    const [timeframe, setTimeframe] = useState('D'); // Default to 24h (Daily)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
            setInputs(prev => ({ ...prev, [name]: value }));
        }
    };

    const calculatedData = useMemo(() => {
        const riesgo = parseFloat(inputs.riesgo) || 0;
        const fluctuacion = parseFloat(inputs.fluctuacion) || 0;
        const fee = parseFloat(inputs.fee) || 0;
        const capitalInicial = parseFloat(inputs.capitalInicial) || 0;
        const trailingStopPerc = parseFloat(inputs.trailingStop) || 0;
        
        if (capitalInicial === 0 || riesgo === 0 || fluctuacion === 0) return {};
        
        const entryPrice = MOCK_CURRENT_PRICE;

        // Financial calculations based on a hypothetical successful trade
        const inversion = capitalInicial * (riesgo / 100);
        const profitAmount = inversion * (fluctuacion / 100);
        const feeAmount = inversion * (fee / 100) * 2; // Entry and exit fees
        const capitalFinal = capitalInicial + profitAmount - feeAmount;
        const liquidez = capitalFinal; // After a trade closes, liquidity is the final capital
        const udr = fluctuacion / riesgo;
        
        // Price level calculations for visual data
        const riesgoPerc = riesgo / 100;
        const fluctuacionPerc = fluctuacion / 100;

        const stopLossPrice = entryPrice * (1 - riesgoPerc);
        const trailingStopPrice = entryPrice * (1 - (trailingStopPerc / 100));
        const profitPrice1 = entryPrice * (1 + fluctuacionPerc);
        const profitDistance = profitPrice1 - entryPrice;
        const profitPrice2 = profitPrice1 + profitDistance;
        const profitPrice3 = profitPrice2 + profitDistance;
        
        return {
            inversion: inversion.toFixed(2),
            capitalFinal: capitalFinal.toFixed(2),
            liquidez: liquidez.toFixed(2),
            udr: udr.toFixed(2),
            udrAFavor: udr >= 1 ? "Sí" : "No",
            totalOperaciones: "N/A",
            relacion: `${fluctuacion}:${riesgo}`,
            
            // Visual price levels
            ordenLimit: entryPrice.toFixed(2),
            profit1: profitPrice1.toFixed(2),
            profit2: profitPrice2.toFixed(2),
            profit3: profitPrice3.toFixed(2),
            stopLoss: stopLossPrice.toFixed(2),
            trailingStop: trailingStopPrice.toFixed(2),
        };
    }, [inputs]);
    
    const visualDataPoints = [
        { label: 'Orden Limit (OL)', color: 'order-limit', value: calculatedData.ordenLimit },
        { label: 'Profit (OB1)', color: 'profit-target', value: calculatedData.profit1 },
        { label: 'Profit (OB2)', color: 'profit-target', value: calculatedData.profit2 },
        { label: 'Profit (OB3)', color: 'profit-target', value: calculatedData.profit3 },
        { label: 'Stop Loss (SL)', color: 'stop-loss', value: calculatedData.stopLoss },
        { label: 'Stop Loss Trailing (SLT)', color: 'trailing-stop', value: calculatedData.trailingStop },
        { label: 'Precio Actual', color: 'current-price', value: MOCK_CURRENT_PRICE.toFixed(2) },
    ];
    
    const timeframes = [
        { label: '1h', value: '60' },   // 60 minutes
        { label: '24h', value: 'D' },   // Daily
        { label: '7d', value: 'W' },    // Weekly
        { label: '30d', value: 'M' },   // Monthly
    ];

    const formatCurrency = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '$0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    }

    const inputFields = {
        'Riesgo': 'riesgo',
        'Fluctuación': 'fluctuacion',
        'Trailing Stop': 'trailingStop',
        'FEE': 'fee',
        'Capital (Inicial)': 'capitalInicial'
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">Gestión de Riesgo y Operaciones</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Datos a Ingresar */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h2 className="text-lg font-semibold text-text mb-4">1. Datos a Ingresar</h2>
                        <div className="space-y-4">
                            {Object.entries(inputFields).map(([label, name]) => (
                                <div key={name}>
                                    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label} {name !== 'capitalInicial' ? '(%)' : '($)'}</label>
                                    <input type="text" id={name} name={name} value={inputs[name as keyof typeof inputs]} onChange={handleInputChange} className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Datos Autocalculados */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h2 className="text-lg font-semibold text-text mb-4">2. Datos Autocalculados</h2>
                        <div className="space-y-4">
                            <div className="bg-blue-900/50 border border-order-limit p-4 rounded-lg text-center">
                                <h3 className="text-sm font-medium text-blue-300">INVERSIÓN</h3>
                                <p className="text-4xl font-bold text-white mt-1">{formatCurrency(calculatedData.inversion)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Card title="Capital (Final)" value={formatCurrency(calculatedData.capitalFinal)} />
                                <Card title="Liquidez" value={formatCurrency(calculatedData.liquidez)} />
                                <Card title="UDR" value={calculatedData.udr || '0.00'} />
                                <Card title="UDR a Favor" value={calculatedData.udrAFavor || 'No'} />
                                <Card title="Total Operaciones" value={calculatedData.totalOperaciones || 'N/A'} />
                                <Card title="Relación" value={calculatedData.relacion || '0:0'} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Datos Visuales */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h2 className="text-lg font-semibold text-text mb-4">3. Datos Visuales</h2>
                        <ul className="space-y-3">
                            {visualDataPoints.map(item => (
                                <li key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-3 bg-${item.color}`}></span>
                                        <span className="text-sm text-text-secondary">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-mono text-text">
                                        {item.value && item.value !== 'N/A' ? formatCurrency(item.value) : 'N/A'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 bg-card p-4 rounded-lg border border-border min-h-[500px] h-[860px] flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <h2 className="text-lg font-semibold text-text">Gráfico en Tiempo Real (BTC/USDT)</h2>
                        <div className="flex bg-button p-1 rounded-lg">
                            {timeframes.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => setTimeframe(value)}
                                    className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                                        timeframe === value ? 'bg-background text-text' : 'text-text-secondary'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-grow">
                      <TradingViewWidget interval={timeframe} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskManagement;