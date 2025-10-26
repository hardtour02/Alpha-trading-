import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
    interval: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ interval }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Create a stable, unique ID for the widget container.
    // This prevents conflicts if multiple widgets are on the same page.
    const widgetContainerId = useRef(`tradingview_widget_${Math.random().toString(36).substring(2, 11)}`).current;

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        // The widget script is re-added on interval change, so we must clear the container first.
        containerRef.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        
        const widgetConfig = {
              "autosize": true,
              "symbol": "BINANCE:BTCUSDT",
              "interval": interval,
              "timezone": "Etc/UTC",
              "theme": "dark",
              "style": "1",
              "locale": "es",
              "enable_publishing": false,
              "hide_side_toolbar": false,
              "allow_symbol_change": true,
              "container_id": widgetContainerId // Use the stable, unique ID.
        };
        
        script.innerHTML = JSON.stringify(widgetConfig);

        // The script will find the container by its ID and render the widget.
        containerRef.current.appendChild(script);

    }, [interval]); // Re-run effect only when interval changes.

    // The container for the widget must have the ID that we pass in the config.
    return (
        <div 
            id={widgetContainerId}
            ref={containerRef} 
            style={{ height: "100%", width: "100%" }}
        />
    );
}

export default React.memo(TradingViewWidget);