
import React, { useState } from 'react';

const InputField: React.FC<{ id: string; label: string; type?: string; placeholder?: string }> = ({ id, label, type = 'text', placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            placeholder={placeholder}
            className="mt-1 block w-full bg-button border border-border rounded-md shadow-sm py-2 px-3 text-text focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const Button: React.FC<{ children: React.ReactNode, onClick?: () => void, fullWidth?: boolean, type?: 'button' | 'submit' }> = ({ children, onClick, fullWidth, type='button' }) => (
    <button
        type={type}
        onClick={onClick}
        className={`bg-button hover:bg-button-hover text-text font-bold py-2 px-4 rounded-lg transition-colors ${fullWidth ? 'w-full' : ''}`}
    >
        {children}
    </button>
);

const Profile: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const handleTestConnection = () => {
        setConnectionStatus('testing');
        setTimeout(() => {
            // Simulate API call result
            const success = Math.random() > 0.3;
            setConnectionStatus(success ? 'success' : 'error');
            setTimeout(() => setConnectionStatus('idle'), 3000);
        }, 1500);
    };

    const getConnectionStatusMessage = () => {
        switch (connectionStatus) {
            case 'testing':
                return <p className="text-sm text-yellow-400">Probando conexión...</p>;
            case 'success':
                return <p className="text-sm text-success-alert">¡Conexión exitosa!</p>;
            case 'error':
                return <p className="text-sm text-risk-alert">Error en la conexión. Verifica tus credenciales.</p>;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text">Perfil y API</h1>

            {/* Profile Form */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-text mb-4">Información del Perfil</h2>
                <form className="space-y-4">
                    <InputField id="username" label="Nombre de Usuario" placeholder="John Doe" />
                    <InputField id="email" label="Correo" type="email" placeholder="john.doe@example.com" />
                    <InputField id="oldPassword" label="Antigua Contraseña" type="password" />
                    <InputField id="newPassword" label="Nueva Contraseña" type="password" />
                    <InputField id="repeatPassword" label="Repetir Nueva Contraseña" type="password" />
                    <div className="pt-2">
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </div>

            {/* API Form */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-text mb-4">Configuración de API</h2>
                <div className="space-y-4">
                    <InputField id="apiKey" label="API Key Binance" type="password" placeholder="••••••••••••••••••••" />
                    <InputField id="apiToken" label="Token Binance" type="password" placeholder="••••••••••••••••••••" />
                    <div className="flex items-center gap-4 pt-2">
                        <Button onClick={handleTestConnection}>Testear Conexión</Button>
                        {getConnectionStatusMessage()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
