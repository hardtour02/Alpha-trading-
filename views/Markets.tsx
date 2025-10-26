
import React, { useState, useMemo } from 'react';
import { MarketData } from '../types';

// Mock Data
const MOCK_MARKET_DATA_USDT: MarketData[] = [
  { pair: 'BTC/USDT', volume: 1500000000, change24h: 2.5, liquidity: 500.5, change1h: 0.5, change1d: 2.5, change1w: 5.8 },
  { pair: 'ETH/USDT', volume: 800000000, change24h: -1.2, liquidity: 300.2, change1h: -0.2, change1d: -1.2, change1w: 3.1 },
  { pair: 'SOL/USDT', volume: 450000000, change24h: 5.8, liquidity: 150.0, change1h: 1.1, change1d: 5.8, change1w: 12.3 },
  { pair: 'XRP/USDT', volume: 300000000, change24h: 0.1, liquidity: 100.7, change1h: 0.0, change1d: 0.1, change1w: -2.4 },
  { pair: 'ADA/USDT', volume: 150000000, change24h: -3.4, liquidity: 80.1, change1h: -0.8, change1d: -3.4, change1w: -5.0 },
  { pair: 'DOGE/USDT', volume: 250000000, change24h: 10.2, liquidity: 95.3, change1h: 2.5, change1d: 10.2, change1w: 25.6 },
];
const MOCK_MARKET_DATA_USDC: MarketData[] = [
  { pair: 'BTC/USDC', volume: 1200000000, change24h: 2.6, liquidity: 450.5, change1h: 0.6, change1d: 2.6, change1w: 6.0 },
  { pair: 'ETH/USDC', volume: 750000000, change24h: -1.1, liquidity: 280.9, change1h: -0.1, change1d: -1.1, change1w: 3.3 },
  { pair: 'LINK/USDC', volume: 90000000, change24h: 4.5, liquidity: 50.1, change1h: 0.9, change1d: 4.5, change1w: 9.8 },
  { pair: 'AVAX/USDC', volume: 120000000, change24h: -2.0, liquidity: 65.4, change1h: -0.5, change1d: -2.0, change1w: 1.2 },
];

type SortKey = keyof MarketData;
type SortOrder = 'asc' | 'desc';

const Markets: React.FC = () => {
  const [stablecoin, setStablecoin] = useState<'USDT' | 'USDC'>('USDT');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const data = stablecoin === 'USDT' ? MOCK_MARKET_DATA_USDT : MOCK_MARKET_DATA_USDC;

  const sortedAndFilteredData = useMemo(() => {
    let filtered = data.filter(item =>
      item.pair.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'pair', label: 'Par' },
    { key: 'volume', label: 'Volumen 24h' },
    { key: 'change24h', label: '% Cambio' },
    { key: 'liquidity', label: 'Liquidez (M USD)' },
    { key: 'change1h', label: 'Cambio 1h' },
    { key: 'change1d', label: 'Cambio 1D' },
    { key: 'change1w', label: 'Cambio 1W' },
  ];
  
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
  const formatPercent = (num: number) => `${num.toFixed(2)}%`;
  const ChangeCell: React.FC<{ value: number }> = ({ value }) => (
    <span className={value >= 0 ? 'text-buy-green' : 'text-sell-red'}>
      {value >= 0 ? '+' : ''}{formatPercent(value)}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Mercados</h1>
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          {/* Stablecoin Toggle */}
          <div className="flex bg-button p-1 rounded-lg">
            <button onClick={() => setStablecoin('USDT')} className={`px-4 py-1 rounded-md text-sm font-semibold transition ${stablecoin === 'USDT' ? 'bg-background text-text' : 'text-text-secondary'}`}>
              USDT
            </button>
            <button onClick={() => setStablecoin('USDC')} className={`px-4 py-1 rounded-md text-sm font-semibold transition ${stablecoin === 'USDC' ? 'bg-background text-text' : 'text-text-secondary'}`}>
              USDC
            </button>
          </div>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Buscar par..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto bg-button border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-border">
              <tr>
                {headers.map(header => (
                  <th key={header.key} className="p-3 text-sm font-semibold text-text-secondary cursor-pointer" onClick={() => handleSort(header.key)}>
                    <div className="flex items-center">
                      {header.label}
                      {sortKey === header.key && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredData.map((item) => (
                <tr key={item.pair} className="border-b border-border hover:bg-button/50">
                  <td className="p-3 font-medium text-text">{item.pair}</td>
                  <td className="p-3 text-text-secondary">${formatNumber(item.volume)}</td>
                  <td className="p-3 font-medium"><ChangeCell value={item.change24h} /></td>
                  <td className="p-3 text-text-secondary">${item.liquidity.toFixed(2)}M</td>
                  <td className="p-3"><ChangeCell value={item.change1h} /></td>
                  <td className="p-3"><ChangeCell value={item.change1d} /></td>
                  <td className="p-3"><ChangeCell value={item.change1w} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Markets;
