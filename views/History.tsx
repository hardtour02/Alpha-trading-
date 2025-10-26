
import React, { useState, useMemo } from 'react';
import { HistoryEvent, HistoryEventType } from '../types';
import Badge from '../components/Badge';

const MOCK_HISTORY_DATA: HistoryEvent[] = [
  { timestamp: '2023-10-27 15:30:05', type: HistoryEventType.Trade, description: 'BUY BTC/USDT @ 65,123.45' },
  { timestamp: '2023-10-27 14:55:10', type: HistoryEventType.Alert, description: 'Signal detected: Doble Suelo en ETH/USDT' },
  { timestamp: '2023-10-27 14:00:00', type: HistoryEventType.System, description: 'System reboot initiated for maintenance.' },
  { timestamp: '2023-10-26 22:10:30', type: HistoryEventType.API, description: 'Binance API key updated successfully.' },
  { timestamp: '2023-10-26 18:45:15', type: HistoryEventType.Trade, description: 'SELL SOL/USDT @ 155.80' },
  { timestamp: '2023-10-26 18:30:00', type: HistoryEventType.Alert, description: 'Liquidity warning for ADA/USDT.' },
];

type SortKey = keyof HistoryEvent;

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<HistoryEventType | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = MOCK_HISTORY_DATA.filter(item => {
      const typeMatch = filterType === 'All' || item.type === filterType;
      const searchMatch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });

    filtered.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [searchTerm, filterType, sortOrder]);
  
  const getBadgeColor = (type: HistoryEventType) => {
    switch (type) {
      case HistoryEventType.Trade: return 'blue';
      case HistoryEventType.API: return 'yellow';
      case HistoryEventType.System: return 'yellow';
      case HistoryEventType.Alert: return 'red';
      default: return 'green';
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Historial / Log del Sistema</h1>
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="typeFilter" className="text-sm font-medium text-text-secondary">Filtrar por tipo:</label>
            <select
                id="typeFilter"
                value={filterType}
                onChange={e => setFilterType(e.target.value as HistoryEventType | 'All')}
                className="bg-button border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="All">Todos</option>
                {Object.values(HistoryEventType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <input
            type="text"
            placeholder="Buscar en descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto bg-button border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-border">
              <tr>
                <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    Fecha/Hora {sortOrder === 'desc' ? '▼' : '▲'}
                </th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Tipo</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((event) => (
                <tr key={event.timestamp + event.description} className="border-b border-border hover:bg-button/50">
                  <td className="p-3 text-text-secondary whitespace-nowrap">{event.timestamp}</td>
                  <td className="p-3">
                    <Badge color={getBadgeColor(event.type)}>{event.type}</Badge>
                  </td>
                  <td className="p-3 text-text">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
