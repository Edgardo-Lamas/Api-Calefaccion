import { useState, useEffect } from 'react';
import { useElementsStore } from '../../store/useElementsStore';
import './PropertiesPanel.css';

export const PropertiesPanel = () => {
  const { radiators, boilers, pipes, selectedElementId, updateElement } = useElementsStore();
  
  // Encontrar el elemento seleccionado
  const selectedElement = 
    radiators.find(r => r.id === selectedElementId) ||
    boilers.find(b => b.id === selectedElementId) ||
    pipes.find(p => p.id === selectedElementId);

  // Estado local para edición
  const [editedValues, setEditedValues] = useState<any>({});

  // Actualizar valores locales cuando cambia la selección
  useEffect(() => {
    if (selectedElement) {
      setEditedValues(selectedElement);
    }
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="properties-panel empty">
        <h3>Propiedades</h3>
        <p>
          Selecciona un elemento para ver y editar sus propiedades
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    setEditedValues({ ...editedValues, [field]: value });
  };

  const handleSave = () => {
    if (selectedElementId) {
      updateElement(selectedElementId, editedValues);
      alert('Propiedades actualizadas');
    }
  };

  const handleCancel = () => {
    setEditedValues(selectedElement);
  };

  // Renderizar según tipo de elemento
  const renderProperties = () => {
    if (selectedElement.type === 'radiator') {
      return (
        <>
          <h3>🔲 Radiador</h3>
          
          <div className="property-field">
            <label>
              Potencia (W)
            </label>
            <input
              type="number"
              value={editedValues.power || 0}
              onChange={(e) => handleChange('power', Number(e.target.value))}
            />
          </div>

          <div className="property-field">
            <label>
              Ancho (px)
            </label>
            <input
              type="number"
              value={editedValues.width || 0}
              onChange={(e) => handleChange('width', Number(e.target.value))}
            />
          </div>

          <div className="property-field">
            <label>
              Alto (px)
            </label>
            <input
              type="number"
              value={editedValues.height || 0}
              onChange={(e) => handleChange('height', Number(e.target.value))}
            />
          </div>

          <div style={{ 
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <strong>ID:</strong> {selectedElement.id.substring(0, 8)}...
          </div>
        </>
      );
    }

    if (selectedElement.type === 'boiler') {
      return (
        <>
          <h3>🔥 Caldera</h3>
          
          <div className="property-field">
            <label>
              Potencia (Kcal/h)
            </label>
            <input
              type="number"
              value={editedValues.power || 0}
              onChange={(e) => handleChange('power', Number(e.target.value))}
            />
            <small style={{ color: '#666', fontSize: '11px' }}>
              ≈ {((editedValues.power || 0) / 860).toFixed(1)} kW
            </small>
          </div>

          <div className="property-field">
            <label>
              Tamaño (px)
            </label>
            <input
              type="number"
              value={editedValues.width || 0}
              onChange={(e) => {
                handleChange('width', Number(e.target.value));
                handleChange('height', Number(e.target.value)); // Mantener cuadrado
              }}
            />
          </div>

          <div style={{ 
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <strong>ID:</strong> {selectedElement.id.substring(0, 8)}...
          </div>
        </>
      );
    }

    if (selectedElement.type === 'pipe') {
      const pipe = selectedElement as any;
      return (
        <>
          <h3>
            {pipe.pipeType === 'supply' ? '🔴 Tubería IDA' : '🔵 Tubería RETORNO'}
          </h3>
          
          <div className="property-field">
            <label>
              Diámetro (mm)
            </label>
            <select
              value={editedValues.diameter || 16}
              onChange={(e) => handleChange('diameter', Number(e.target.value))}
            >
              <option value={12}>12 mm</option>
              <option value={16}>16 mm</option>
              <option value={20}>20 mm</option>
              <option value={25}>25 mm</option>
              <option value={32}>32 mm</option>
            </select>
          </div>

          <div className="property-field">
            <label>
              Material
            </label>
            <select
              value={editedValues.material || 'PEX'}
              onChange={(e) => handleChange('material', e.target.value)}
            >
              <option value="PEX">PEX</option>
              <option value="Cobre">Cobre</option>
              <option value="Multicapa">Multicapa</option>
              <option value="Acero">Acero</option>
            </select>
          </div>

          <div style={{ 
            padding: '10px',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <div><strong>Longitud:</strong> {(pipe.length || 0).toFixed(2)} m</div>
            <div><strong>Puntos:</strong> {pipe.points?.length || 0}</div>
            <div><strong>Tipo:</strong> {pipe.pipeType === 'supply' ? 'IDA' : 'RETORNO'}</div>
          </div>

          <div style={{ 
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <strong>ID:</strong> {selectedElement.id.substring(0, 8)}...
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="properties-panel">
      {renderProperties()}

      <div className="property-actions">
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
          }}
        >
          Guardar
        </button>
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: '#757575',
            color: 'white',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

