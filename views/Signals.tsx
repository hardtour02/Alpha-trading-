
import React from 'react';
import { Signal } from '../types';
import { FireIcon } from '../components/icons';
import Badge from '../components/Badge';

const MOCK_REVERSION_SIGNALS: Signal[] = [
    { pair: 'ETH/USDT', pattern: 'Doble Suelo', time: '14:30', variation: 2.1, liquidity: 300.2, isHot: true },
    { pair: 'ADA/USDT', pattern: 'Hombro Cabeza Hombro', time: '12:15', variation: -3.5, liquidity: 80.1 },
    { pair: 'LINK/USDT', pattern: 'Cuña Ascendente', time: '11:05', variation: -1.8, liquidity: 50.1 },
    { pair: 'MATIC/USDT', pattern: 'Triángulo Simétrico', time: '10:45', variation: 1.5, liquidity: 45.3 },
];

const MOCK_SHORT_TERM_SIGNALS: Signal[] = [
    { pair: 'SOL/USDT', pattern: 'Bandera Alcista', time: '15:05', variation: 1.2, liquidity: 150.0, isHot: true },
    { pair: 'DOGE/USDT', pattern: 'Engulfing Bajista', time: '15:02', variation: -0.8, liquidity: 95.3 },
    { pair: 'XRP/USDT', pattern: 'Martillo', time: '14:55', variation: 0.5, liquidity: 100.7 },
];

const SignalTable: React.FC<{ title: string; data: Signal[], hasAnimation?: boolean }> = ({ title, data, hasAnimation = false }) => (
    <div className="bg-card p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b-2 border-border">
                    <tr>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Par</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Patrón Detectado</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Hora Señal</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">% Variación</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Liquidez</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((signal) => (
                        <tr key={signal.pair + signal.pattern} className={`border-b border-border hover:bg-button/50 ${hasAnimation && signal.isHot ? 'border-l-2 border-yellow-500' : ''}`}>
                            <td className="p-3 font-medium text-text">
                                <div className="flex items-center gap-2">
                                    {signal.pair}
                                    {signal.isHot && (
                                        <div className={`relative ${hasAnimation ? 'animate-pulse' : ''}`}>
                                            <FireIcon />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="p-3 text-text-secondary">
                                <Badge color={signal.variation > 0 ? "green" : "red"}>{signal.pattern}</Badge>
                            </td>
                            <td className="p-3 text-text-secondary">{signal.time}</td>
                            <td className={`p-3 font-medium ${signal.variation >= 0 ? 'text-buy-green' : 'text-sell-red'}`}>
                                {signal.variation >= 0 ? '+' : ''}{signal.variation.toFixed(2)}%
                            </td>
                            <td className="p-3 text-text-secondary">${signal.liquidity.toFixed(2)}M</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const Signals: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Señales</h1>
      <div className="space-y-8">
        <SignalTable title="Señales Reversión (1h)" data={MOCK_REVERSION_SIGNALS} />
        <SignalTable title="Señales Velas Cortas (5-15m)" data={MOCK_SHORT_TERM_SIGNALS} hasAnimation />
      </div>
    </div>
  );
};

export default Signals;
