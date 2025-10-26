
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { getBtcTrendSignal } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [btcTrend, setBtcTrend] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrend = async () => {
      setIsLoading(true);
      try {
        const trend = await getBtcTrendSignal();
        setBtcTrend(trend);
      } catch(e) {
        console.error(e);
        setBtcTrend(null); // Set to null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrend();
  }, []);

  const renderBtcTrend = () => {
    if (isLoading) {
      return <div className="animate-pulse bg-gray-600 rounded-full w-24 h-7"></div>;
    }
    if (btcTrend === null) {
      return <Badge color="yellow">No disponible</Badge>;
    }
    return btcTrend ? <Badge color="green">Tendencia Alcista</Badge> : <Badge color="red">Tendencia Bajista</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <div className="flex items-center gap-2">
            <span className="font-semibold">Señal BTC Tendencia:</span>
            {renderBtcTrend()}
        </div>
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Capital Inicial" value="$10,000" />
        <Card title="Liquidez Actual" value="$12,450.75" change={24.51} />
        <Card title="Total Operaciones" value="134" />
        <Card title="UDR" value="1.85" />
      </div>

      {/* Accesos Directos */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold text-text mb-4">Accesos Directos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/markets" className="bg-button hover:bg-button-hover text-text font-bold py-3 px-4 rounded-lg text-center transition-colors">
            Ver Mercados
          </Link>
          <Link to="/signals" className="bg-button hover:bg-button-hover text-text font-bold py-3 px-4 rounded-lg text-center transition-colors">
            Analizar Señales
          </Link>
          <Link to="/risk-management" className="bg-button hover:bg-button-hover text-text font-bold py-3 px-4 rounded-lg text-center transition-colors">
            Gestión de Riesgo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
