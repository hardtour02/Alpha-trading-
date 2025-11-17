import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from 'recharts';

// --- TYPE DEFINITIONS ---
interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

type SignalType = 'reversion_pattern' | 'candle_pattern';

interface SignalEvent {
  id: string;
  time: string;
  symbol: string;
  timeframe: string;
  pattern_name: string;
  signal_type: SignalType;
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  created_at: string;
  ohlc: CandlestickData[];
}

// --- MOCK DATA ---
const MOCK_SIGNALS_DATA: SignalEvent[] = [
  {
    id: '4bbe8dbb-f924-4b81-9b07-1dadffccf34c',
    time: '2025-11-10T00:15:00.000Z',
    symbol: 'SOL/USDC',
    timeframe: '15m',
    pattern_name: 'Double Bottom',
    signal_type: 'reversion_pattern',
    confidence: 'None',
    created_at: '2025-11-10T00:15:03.000Z',
    ohlc: [
      { time: '22:00', open: 165.1, high: 165.6, low: 164.4, close: 164.8 },
      { time: '22:15', open: 164.8, high: 165.2, low: 164.3, close: 164.5 },
      { time: '22:30', open: 164.5, high: 164.6, low: 164.4, close: 164.5 },
      { time: '22:45', open: 164.9, high: 166.8, low: 164.8, close: 165.2 },
      { time: '23:00', open: 165.2, high: 165.5, low: 164.9, close: 165.3 },
      { time: '23:15', open: 165.3, high: 165.4, low: 164.8, close: 165.1 },
      { time: '23:30', open: 164.2, high: 164.6, low: 163.9, close: 164.4 },
      { time: '23:45', open: 164.4, high: 164.8, low: 164.3, close: 164.7 },
      { time: '00:00', open: 164.7, high: 165.3, low: 163.5, close: 165.2 },
      { time: '00:15', open: 165.2, high: 165.4, low: 165.1, close: 165.3 },
    ],
  },
  {
    id: 'be0eae20-1a31-47e8-8618-5dd4bb8c0ca9',
    time: '2025-11-10T00:15:00.000Z',
    symbol: 'BTC/USDC',
    timeframe: '1h',
    pattern_name: 'Three White Soldiers',
    signal_type: 'candle_pattern',
    confidence: 'High',
    created_at: '2025-11-10T00:16:20.000Z',
    ohlc: [
      { time: '20:00', open: 68500, high: 68600, low: 68300, close: 68400 },
      { time: '21:00', open: 68400, high: 68900, low: 68350, close: 68850 },
      { time: '22:00', open: 68850, high: 69200, low: 68800, close: 69150 },
      { time: '23:00', open: 69150, high: 69500, low: 69100, close: 69450 },
      { time: '00:00', open: 69450, high: 69800, low: 69400, close: 69750 },
    ],
  },
];

// --- HELPERS ---
const translateSignalType = (type: SignalType): string => {
    const map = {
        reversion_pattern: 'Patrón de Gráfico',
        candle_pattern: 'Patrón de Vela',
    };
    return map[type] || type;
};

// --- COMPONENTS ---

const CandlestickChart: React.FC<{ data: CandlestickData[], symbol: string }> = ({ data, symbol }) => {
  const chartData = useMemo(() => data.map(d => ({
    ...d,
    body: [d.open, d.close],
    wick: [d.low, d.high],
  })), [data]);

  const yDomain = useMemo(() => {
      const allValues = data.flatMap(d => [d.low, d.high]);
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const buffer = (max - min) * 0.05;
      return [min - buffer, max + buffer];
  }, [data]);
  
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-2 border border-border rounded-md text-xs">
          <p className="font-bold">{label}</p>
          <p>Apertura: <span className="font-mono">{data.open}</span></p>
          <p>Máximo: <span className="font-mono">{data.high}</span></p>
          <p>Mínimo: <span className="font-mono">{data.low}</span></p>
          <p>Cierre: <span className="font-mono">{data.close}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-4 h-80">
      <h3 className="text-lg font-semibold text-text mb-2">Gráfico de velas - {symbol}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis dataKey="time" stroke="#888888" fontSize={12} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            domain={yDomain}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <CartesianGrid stroke="#333333" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="wick" fill="#888888" barSize={1} />
          <Bar dataKey="body">
            {chartData.map((entry, index) => (
              <rect key={`cell-${index}`} fill={entry.close > entry.open ? '#00CC00' : '#FF4D4D'} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};


const SignalItem: React.FC<{ signal: SignalEvent }> = ({ signal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  const eventDate = new Date(signal.time);
  const signalTypeSpanish = translateSignalType(signal.signal_type);

  const tableHeaders: { key: keyof SignalEvent, label: string }[] = [
      { key: 'id', label: 'ID' },
      { key: 'time', label: 'Hora' },
      { key: 'symbol', label: 'Símbolo' },
      { key: 'timeframe', label: 'Temporalidad' },
      { key: 'pattern_name', label: 'Nombre del Patrón' },
      { key: 'signal_type', label: 'Tipo de Señal' },
      { key: 'confidence', label: 'Confianza' },
      { key: 'created_at', label: 'Creado en' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-button/50 transition-colors"
      >
        <div className="font-semibold text-text">
          Evento {signal.id.substring(0, 8)}... - {signal.symbol} {signal.pattern_name} ({eventDate.toLocaleString('es-ES')}) - Tipo: {signalTypeSpanish}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-border">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-button">
                <tr>
                  {tableHeaders.map(header => <th key={header.key} className="p-2 font-semibold text-text-secondary">{header.label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-card">
                  {tableHeaders.map(header => {
                      const value = signal[header.key];
                      return (
                          <td key={header.key} className="p-2 text-text-secondary font-mono">
                              {header.key === 'signal_type' ? signalTypeSpanish : value as string}
                          </td>
                      )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-button hover:bg-button-hover text-text font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {showChart ? 'Ocultar' : 'Mostrar'} gráfico de velas
          </button>
          {showChart && <CandlestickChart data={signal.ohlc} symbol={signal.symbol} />}
        </div>
      )}
    </div>
  );
};

const Signals: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2025-11-10');
  const [typeFilter, setTypeFilter] = useState<'all' | SignalType>('all');

  const filteredSignals = useMemo(() => {
    return MOCK_SIGNALS_DATA.filter(signal => {
      const signalDate = signal.time.substring(0, 10);
      const dateMatch = signalDate === selectedDate;
      const typeMatch = typeFilter === 'all' || signal.signal_type === typeFilter;
      return dateMatch && typeMatch;
    });
  }, [selectedDate, typeFilter]);

  const filterButtons: { key: typeof typeFilter, label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'reversion_pattern', label: 'Patrones de Gráfico' },
    { key: 'candle_pattern', label: 'Patrones de Vela' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Señales de Trading</h1>
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-text-secondary mb-2">
            Selecciona la fecha de los eventos
            </label>
            <input
            type="date"
            id="event-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-button border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Filtrar por tipo de patrón</label>
            <div className="flex items-center gap-2 bg-button p-1 rounded-lg w-full sm:w-auto">
                {filterButtons.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setTypeFilter(f.key)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${typeFilter === f.key ? 'bg-blue-600 text-white' : 'text-text-secondary hover:bg-button-hover'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSignals.length > 0 ? (
          filteredSignals.map(signal => <SignalItem key={signal.id} signal={signal} />)
        ) : (
          <div className="bg-card p-4 rounded-lg border border-border text-center text-text-secondary">
            No se encontraron señales para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default Signals;
