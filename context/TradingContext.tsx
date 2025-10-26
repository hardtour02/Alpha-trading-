import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the calculated data and inputs
export interface TradeData {
    inversion?: string;
    capitalFinal?: string;
    liquidez?: string;
    udr?: string;
    udrAFavor?: string;
    totalOperaciones?: string;
    relacion?: string;
    delta?: string;
    trailingStop?: string;
    profitOB1?: string;
    profitOB2?: string;
    profitOB3?: string;
    sltProfit?: string;
    profit1?: string;
    profit2?: string;
    profit3?: string;
    stopLoss?: string;
    stopLossTrailing?: string;
    // Include original inputs for history
    capitalInicial?: string;
    riesgo?: string;
    fluctuacion?: string;
    ordenLimit?: string;
    timestamp?: string; // To uniquely identify and sort
}

export interface AlertState {
    message: string;
    visible: boolean;
}

interface TradingContextType {
    latestCalculatedData: TradeData;
    tradingHistory: TradeData[];
    alert: AlertState;
    updateLatestData: (data: TradeData) => void;
    addTradeToHistory: (tradeData: TradeData) => void;
    showAlert: (message: string) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider = ({ children }: { children: ReactNode }) => {
    const [latestCalculatedData, setLatestCalculatedData] = useState<TradeData>({
        capitalInicial: '10000',
        liquidez: '0',
        totalOperaciones: '0',
        udr: '0',
    });
    const [tradingHistory, setTradingHistory] = useState<TradeData[]>([]);
    const [alert, setAlert] = useState<AlertState>({ message: '', visible: false });


    const updateLatestData = (data: TradeData) => {
        setLatestCalculatedData(data);
    };

    const addTradeToHistory = (tradeData: TradeData) => {
        const tradeWithTimestamp = { ...tradeData, timestamp: new Date().toISOString() };
        setTradingHistory(prev => [tradeWithTimestamp, ...prev]);
    };
    
    const showAlert = (message: string) => {
        setAlert({ message, visible: true });
        setTimeout(() => {
            setAlert({ message: '', visible: false });
        }, 3000); // Hide after 3 seconds
    };

    return (
        <TradingContext.Provider value={{ latestCalculatedData, tradingHistory, updateLatestData, addTradeToHistory, alert, showAlert }}>
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