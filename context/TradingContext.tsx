import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';

// Define the shape of the calculated data and inputs
export interface TradeData {
    // Operation details
    par: string;
    inversion?: string;
    ganancia?: number; // Calculated on close
    comision?: number; // Calculated on close
    
    // Price levels
    ordenLimit?: string;
    stopLoss?: string;
    profit1?: string;
    profit2?: string;
    profit3?: string;
    stopLossTrailing?: string;
    
    // Calculated UDR metrics
    udr?: string;
    udrAFavor?: string;
    delta?: string;
    trailingStop?: string;
    relacion?: string;
    
    // Profit amounts at levels
    profitOB1?: string;
    profitOB2?: string;
    profitOB3?: string;
    sltProfit?: string;
    
    // Context from Risk Management
    capitalInicial?: string;
    riesgo?: string;
    fluctuacion?: string;

    // System fields
    timestamp: string; // To uniquely identify and sort
    status: 'open' | 'closed';
    closingProfitLevel?: 'OB1' | 'OB2' | 'OB3' | 'SL';
    udrGanados?: number;
}

export type NewTradeData = Omit<TradeData, 'timestamp' | 'status' | 'closingProfitLevel' | 'ganancia' | 'udrGanados' | 'comision'>;

export interface AlertState {
    message: string;
    visible: boolean;
    type: 'success' | 'error';
}

interface TradingContextType {
    latestCalculatedData: Partial<TradeData>;
    tradingHistory: TradeData[];
    alert: AlertState;
    initialCapital: string;
    accumulatedBalance: number;
    updateLatestData: (data: Partial<TradeData>) => void;
    addTradeToHistory: (tradeData: NewTradeData) => TradeData;
    showAlert: (message: string, type?: 'success' | 'error') => void;
    closeTrade: (timestamp: string, profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

interface TradingProviderProps {
    children: ReactNode;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
    const [latestCalculatedData, setLatestCalculatedData] = useState<Partial<TradeData>>({
        capitalInicial: '10000',
    });
    const [tradingHistory, setTradingHistory] = useState<TradeData[]>(() => {
         try {
            const localData = window.localStorage.getItem('tradingHistory');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return [];
        }
    });
    const [alert, setAlert] = useState<AlertState>({ message: '', visible: false, type: 'success' });

    useEffect(() => {
        try {
            window.localStorage.setItem('tradingHistory', JSON.stringify(tradingHistory));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [tradingHistory]);

    const initialCapital = useMemo(() => latestCalculatedData.capitalInicial || '10000', [latestCalculatedData.capitalInicial]);

    const totalPnL = useMemo(() => 
        tradingHistory
            .filter(trade => trade.status === 'closed' && trade.ganancia)
            .reduce((acc, trade) => acc + (trade.ganancia || 0), 0)
    , [tradingHistory]);

    const accumulatedBalance = useMemo(() => parseFloat(initialCapital) + totalPnL, [initialCapital, totalPnL]);

    const updateLatestData = useCallback((data: Partial<TradeData>) => {
        setLatestCalculatedData(prev => ({...prev, ...data}));
    }, []);

    const addTradeToHistory = useCallback((tradeData: NewTradeData): TradeData => {
        const tradeWithTimestamp: TradeData = { 
            ...tradeData,
            timestamp: new Date().toISOString(),
            status: 'open' as const
        };
        setTradingHistory(prev => [tradeWithTimestamp, ...prev]);
        return tradeWithTimestamp;
    }, []);
    
    const showAlert = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setAlert({ message, visible: true, type });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, visible: false }));
        }, 3000); // Hide after 3 seconds
    }, []);

    const closeTrade = useCallback((timestamp: string, profitLevel: 'OB1' | 'OB2' | 'OB3' | 'SL') => {
        setTradingHistory(prev => 
            prev.map(trade => {
                if (trade.timestamp === timestamp) {
                    let rawGanancia = 0;
                    const inversion = parseFloat(trade.inversion || '0') || 0;
                    
                    let udrGanados = 0;
                    switch(profitLevel) {
                        case 'OB1': udrGanados = 1; break;
                        case 'OB2': udrGanados = 2; break;
                        case 'OB3': udrGanados = 3; break;
                        case 'SL': udrGanados = -1; break;
                    }

                    if (profitLevel.startsWith('OB')) {
                        const profitKeyMap = { 'OB1': 'profitOB1', 'OB2': 'profitOB2', 'OB3': 'profitOB3' };
                        const profitKey = profitKeyMap[profitLevel] as keyof TradeData;
                        const profitValue = parseFloat(String(trade[profitKey] || '0')) || 0;
                        rawGanancia = profitValue - inversion;
                    } else if (profitLevel === 'SL') {
                        rawGanancia = - (parseFloat(trade.udr || '0') || 0);
                    }

                    const openFee = inversion * 0.001; // 0.10%
                    const closePositionValue = inversion + rawGanancia;
                    const closeFee = closePositionValue * 0.001; // 0.10%
                    const totalComision = openFee + closeFee;
                    const netGanancia = rawGanancia - totalComision;

                    return { 
                        ...trade, 
                        status: 'closed' as const, 
                        closingProfitLevel: profitLevel,
                        ganancia: netGanancia,
                        comision: totalComision,
                        udrGanados: udrGanados
                    };
                }
                return trade;
            })
        );
        showAlert(`Operación cerrada en ${profitLevel}`, 'success');
    }, [showAlert]);

    const value = { latestCalculatedData, tradingHistory, updateLatestData, addTradeToHistory, alert, showAlert, closeTrade, initialCapital, accumulatedBalance };

    return (
        <TradingContext.Provider value={value}>
            {children}
        </TradingContext.Provider>
    );
};

export const useTradingContext = () => {
    const context = useContext(TradingContext);
    if (context === undefined) {
        throw new Error('useTradingContext must be used within a TradingProvider');
    }
    return context;
};