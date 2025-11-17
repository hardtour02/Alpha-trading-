import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../components/Card';
import { useTradingContext, TradeData } from '../context/TradingContext';
import CloseTradeModal from '../components/CloseTradeModal';
import Badge from '../components/Badge';
import { PlusIcon, CryptoIcon } from '../components/icons';

type FilterState = 'all' | 'open' | 'closed' | 'winning' | 'losing';

const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

const PerformanceCard: React.FC<{
    operaciones: TradeData[];
    capitalInicial: string | undefined;
}> = ({ operaciones, capitalInicial }) => {
    const initialCapital = useMemo(() => parseFloat(capitalInicial || '0'), [capitalInicial]);

    const closedTrades = useMemo(() => operaciones.filter(o => o.status === 'closed'), [operaciones]);
    const winningTrades = useMemo(() => closedTrades.filter(o => o.ganancia !== undefined && o.ganancia > 0), [closedTrades]);
    const losingTrades = useMemo(() => closedTrades.filter(o => o.ganancia !== undefined && o.ganancia <= 0), [closedTrades]);

    const totalTrades = operaciones.length;
    const totalPnL = useMemo(() => closedTrades.reduce((acc, trade) => acc + (trade.ganancia || 0), 0), [closedTrades]);
    const accumulatedBalance = initialCapital + totalPnL;
    
    const balanceColor = accumulatedBalance > initialCapital ? 'text-buy-green' : accumulatedBalance < initialCapital ? 'text-sell-red' : 'text-text';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card title="Total de Operaciones" value={totalTrades} />
            <Card title="Operaciones Ganadoras" value={winningTrades.length} />
            <Card title="Operaciones Perdedoras" value={losingTrades.length} />
            <div className="bg-card p-4 rounded-lg border border-border flex-1 min-w-[200px]">
                <h3 className="text-sm font-medium text-text-secondary">Saldo Total Acumulado</h3>
                <p className={`text-2xl font-semibold mt-1 ${balanceColor}`}>
                    {formatCurrency(accumulatedBalance)}
                </p>
            </div>
        </div>
    );
};

const PnLChart: React.FC<{ operaciones: TradeData[]; capitalInicial: string | undefined; }> = ({ operaciones, capitalInicial }) => {
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');

    const initialCapital = useMemo(() => {
        const cap = parseFloat(capitalInicial || '1');
        return cap === 0 ? 1 : cap; // Avoid division by zero
    }, [capitalInicial]);
    
    const CustomizedLabel: React.FC<any> = (props) => {
        const { x, y, index, value } = props;
        // Do not render label for the first point (which is "Inicio" at 0%)
        if (index === 0) {
            return null;
        }
        return (
            <text x={x} y={y} dy={-10} fill="#888888" fontSize={12} textAnchor="middle">
                {`${value.toFixed(1)}%`}
            </text>
        );
    };

    const chartData = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();

        switch (timeFilter) {
            case 'day':
                filterDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        const closedAndFiltered = operaciones
            .filter(o => o.status === 'closed' && new Date(o.timestamp) >= filterDate)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (closedAndFiltered.length === 0) return [];

        let cumulativePnl = 0;
        const dataPoints = closedAndFiltered.map(trade => {
            cumulativePnl += trade.ganancia || 0;
            return {
                date: new Date(trade.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                pnlPercentage: (cumulativePnl / initialCapital) * 100,
            };
        });
        
        return [{ date: 'Inicio', pnlPercentage: 0 }, ...dataPoints];

    }, [operaciones, initialCapital, timeFilter]);

    const filterButtons: { key: typeof timeFilter, label: string }[] = [
        { key: 'day', label: 'Día' },
        { key: 'week', label: 'Semana' },
        { key: 'month', label: 'Mes' },
        { key: 'year', label: 'Año' }
    ];

    return (
        <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold text-text">P&L Acumulado (%)</h3>
                 <div className="flex items-center gap-2 bg-button p-1 rounded-lg">
                    {filterButtons.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setTimeFilter(f.key)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeFilter === f.key ? 'bg-blue-600 text-white' : 'text-text-secondary hover:bg-button-hover'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>
             {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#252525',
                                border: '1px solid #333333',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#CCCCCC' }}
                            formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                        />
                        <ReferenceLine y={0} stroke="#888888" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="pnlPercentage" name="P&L %" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3, fill: '#4CAF50' }} activeDot={{ r: 6 }} label={<CustomizedLabel />} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-text-secondary">
                    No hay operaciones cerradas en este período para mostrar.
                </div>
            )}
        </div>
    );
};


const TradingLogTable: React.FC<{ operaciones: TradeData[], onCerrarClick: (trade: TradeData) => void, newTradeTimestamp?: string }> = ({ operaciones, onCerrarClick, newTradeTimestamp }) => {
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b-2 border-border">
                    <tr>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Acción</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Fecha</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Par</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Inversión</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Entrada (OL)</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Stop Loss (SL)</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">OB1</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">UDR</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Ganancia/Pérdida</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Comisiones</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Resultado (UDR)</th>
                    </tr>
                </thead>
                <tbody>
                    {operaciones.length > 0 ? operaciones.map((trade) => (
                        <tr key={trade.timestamp} className={`border-b border-border hover:bg-button/50 transition-colors ${trade.timestamp === newTradeTimestamp ? 'animate-highlight-fade-out' : ''} ${trade.status === 'closed' ? 'opacity-60' : ''}`}>
                            <td className="p-3 whitespace-nowrap">
                                {trade.status === 'open' ? (
                                    <button onClick={() => onCerrarClick(trade)} className="bg-sell-red hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors">Cerrar</button>
                                ) : (
                                    <Badge color={trade.ganancia && trade.ganancia > 0 ? 'green' : 'red'}>
                                        Cerrada en {trade.closingProfitLevel}
                                    </Badge>
                                )}
                            </td>
                            <td className="p-3 text-text-secondary whitespace-nowrap">{formatDate(trade.timestamp)}</td>
                            <td className="p-3 text-text font-semibold flex items-center gap-2"><CryptoIcon className="h-5 w-5 text-yellow-500" />{trade.par}</td>
                            <td className="p-3 text-text-secondary font-mono">{formatCurrency(trade.inversion)}</td>
                            <td className="p-3 text-text-secondary font-mono">{formatCurrency(trade.ordenLimit)}</td>
                            <td className="p-3 text-text-secondary font-mono">{formatCurrency(trade.stopLoss)}</td>
                            <td className="p-3 text-text-secondary font-mono">{formatCurrency(trade.profit1)}</td>
                            <td className="p-3 text-text-secondary font-mono">{formatCurrency(trade.udr)}</td>
                            <td className={`p-3 font-mono font-semibold whitespace-nowrap ${trade.ganancia ? (trade.ganancia > 0 ? 'text-buy-green' : 'text-sell-red') : 'text-text-secondary'}`}>
                                {trade.status === 'closed' ? formatCurrency(trade.ganancia) : 'N/A'}
                            </td>
                            <td className="p-3 text-text-secondary font-mono whitespace-nowrap">
                                {trade.status === 'closed' ? formatCurrency(trade.comision) : 'N/A'}
                            </td>
                             <td className={`p-3 font-mono font-semibold whitespace-nowrap ${trade.udrGanados ? (trade.udrGanados > 0 ? 'text-buy-green' : 'text-sell-red') : 'text-text-secondary'}`}>
                                {trade.status === 'closed' && trade.udrGanados !== undefined
                                    ? `${trade.udrGanados > 0 ? '+' : ''}${trade.udrGanados} R`
                                    : 'N/A'
                                }
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={11} className="text-center py-10">
                                <p className="text-text-secondary">No hay operaciones que coincidan con los filtros.</p>
                                <p className="text-text-secondary mt-2">Usa el botón <span className="inline-block bg-blue-600 text-white rounded-full h-5 w-5 text-center leading-5 mx-1">+</span> para planificar una nueva operación.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { tradingHistory, closeTrade, initialCapital } = useTradingContext();
    const location = useLocation();
    const newTradeTimestamp = location.state?.newTradeTimestamp;

    const [filter, setFilter] = useState<FilterState>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<TradeData | null>(null);

    const filteredHistory = useMemo(() => {
        return tradingHistory.filter(trade => {
            const filterMatch = 
                filter === 'all' ||
                (filter === 'open' && trade.status === 'open') ||
                (filter === 'closed' && trade.status === 'closed') ||
                (filter === 'winning' && trade.status === 'closed' && (trade.ganancia || 0) > 0) ||
                (filter === 'losing' && trade.status === 'closed' && (trade.ganancia || 0) <= 0);

            const searchMatch = searchTerm === '' || (trade.par && trade.par.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return filterMatch && searchMatch;
        });
    }, [tradingHistory, filter, searchTerm]);

    const handleOpenModal = (trade: TradeData) => {
        setSelectedTrade(trade);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrade(null);
    };

    const handleConfirmClose = (timestamp: string, profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => {
        if(timestamp){
            closeTrade(timestamp, profitLevel);
        }
    };

    const filterButtons: { key: FilterState, label: string }[] = [
        { key: 'all', label: 'Todas' },
        { key: 'open', label: 'Abiertas' },
        { key: 'closed', label: 'Cerradas' },
        { key: 'winning', label: 'Ganadoras' },
        { key: 'losing', label: 'Perdedoras' },
    ];

    return (
        <div className="space-y-6">
            {isModalOpen && selectedTrade && (
                <CloseTradeModal 
                    trade={selectedTrade}
                    onClose={handleCloseModal}
                    onConfirmClose={handleConfirmClose}
                />
            )}

            <h1 className="text-3xl font-bold text-text">Registro Trading</h1>

            <PerformanceCard 
                operaciones={tradingHistory} 
                capitalInicial={initialCapital} 
            />
            
            <PnLChart
                operaciones={tradingHistory}
                capitalInicial={initialCapital}
            />

            <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-button p-1 rounded-lg flex-wrap">
                        {filterButtons.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'text-text-secondary hover:bg-button-hover'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por par (ej. BTC/USDT)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto bg-button border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
                <TradingLogTable operaciones={filteredHistory} onCerrarClick={handleOpenModal} newTradeTimestamp={newTradeTimestamp} />
            </div>

            <Link to="/risk-management" className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-20" aria-label="Añadir nueva operación">
                <PlusIcon className="h-6 w-6" />
            </Link>
        </div>
    );
};

export default Dashboard;