import React, { useState } from 'react';
import { useCompanyStore } from '../../stores/companyStore';
import './ConfigPanel.css';

export const ConfigPanel: React.FC = () => {
  const { companyInfo, updateCompanyInfo, addPromotion, updatePromotion, deletePromotion } = useCompanyStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateCompanyInfo({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddPromotion = () => {
    if (!newPromoName.trim()) return;
    
    addPromotion({
      id: Date.now().toString(),
      name: newPromoName,
      discount: Number(newPromoDiscount),
      enabled: true,
    });
    
    setNewPromoName('');
    setNewPromoDiscount('10');
  };

  if (isCollapsed) {
    return (
      <button
        className="config-toggle-button"
        onClick={() => setIsCollapsed(false)}
        title="Configuración de Empresa"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="config-panel">
      <div className="config-header">
        <h3>⚙️ Configuración de Empresa</h3>
        <button onClick={() => setIsCollapsed(true)}>✕</button>
      </div>

      <div className="config-content">
        {/* Logo */}
        <div className="config-section">
          <label>Logo de la Empresa</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {companyInfo.logo && (
            <div className="logo-preview">
              <img src={companyInfo.logo} alt="Logo" />
              <button onClick={() => updateCompanyInfo({ logo: null })}>Eliminar</button>
            </div>
          )}
        </div>

        {/* Datos de empresa */}
        <div className="config-section">
          <label>Nombre de la Empresa</label>
          <input
            type="text"
            value={companyInfo.companyName}
            onChange={(e) => updateCompanyInfo({ companyName: e.target.value })}
            placeholder="Ej: Calefacción Pro S.A."
          />
        </div>

        <div className="config-section">
          <label>Dirección</label>
          <input
            type="text"
            value={companyInfo.address}
            onChange={(e) => updateCompanyInfo({ address: e.target.value })}
            placeholder="Ej: Av. Principal 123, Ciudad"
          />
        </div>

        <div className="config-section">
          <label>Teléfono</label>
          <input
            type="text"
            value={companyInfo.phone}
            onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
            placeholder="Ej: +54 11 1234-5678"
          />
        </div>

        <div className="config-section">
          <label>Email</label>
          <input
            type="email"
            value={companyInfo.email}
            onChange={(e) => updateCompanyInfo({ email: e.target.value })}
            placeholder="Ej: contacto@empresa.com"
          />
        </div>

        <div className="config-section">
          <label>Sitio Web</label>
          <input
            type="text"
            value={companyInfo.website}
            onChange={(e) => updateCompanyInfo({ website: e.target.value })}
            placeholder="Ej: www.empresa.com"
          />
        </div>

        {/* Promociones */}
        <div className="config-section">
          <h4>Promociones</h4>
          
          <div className="promo-add">
            <input
              type="text"
              value={newPromoName}
              onChange={(e) => setNewPromoName(e.target.value)}
              placeholder="Nombre de la promoción"
            />
            <input
              type="number"
              value={newPromoDiscount}
              onChange={(e) => setNewPromoDiscount(e.target.value)}
              min="0"
              max="100"
              style={{ width: '80px' }}
            />
            <span>%</span>
            <button onClick={handleAddPromotion}>Agregar</button>
          </div>

          <div className="promo-list">
            {companyInfo.promotions.map((promo) => (
              <div key={promo.id} className="promo-item">
                <label>
                  <input
                    type="checkbox"
                    checked={promo.enabled}
                    onChange={(e) => updatePromotion(promo.id, { enabled: e.target.checked })}
                  />
                  <span>{promo.name} ({promo.discount}%)</span>
                </label>
                <button onClick={() => deletePromotion(promo.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
