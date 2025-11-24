import { useState, useEffect } from 'react';
import { useElementsStore } from '../../store/useElementsStore';
import { getPipeDimensionInfo } from '../../utils/pipeDimensioning';
import './PropertiesPanel.css';

export const PropertiesPanel = () => {
  const { radiators, boilers, pipes, selectedElementId, updateElement, removeElement, setSelectedElement } = useElementsStore();
  
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
    if (selectedElementId && selectedElement) {
      // Solo enviar campos editables según tipo de elemento
      const updates: any = {};
      if (selectedElement.type === 'radiator') {
        updates.power = editedValues.power;
        updates.width = editedValues.width;
        updates.height = editedValues.height;
      } else if (selectedElement.type === 'boiler') {
        updates.power = editedValues.power;
        updates.width = editedValues.width;
        updates.height = editedValues.height;
      } else if (selectedElement.type === 'pipe') {
        updates.diameter = editedValues.diameter;
        updates.material = editedValues.material;
      }
      
      updateElement(selectedElementId, updates);
      setSelectedElement(null); // Cerrar panel
    }
  };

  const handleCancel = () => {
    setEditedValues(selectedElement);
    setSelectedElement(null); // Cerrar panel
  };

  const handleDelete = () => {
    if (selectedElementId && confirm('¿Estás seguro de eliminar este elemento?')) {
      removeElement(selectedElementId);
      setSelectedElement(null); // Cerrar panel
    }
  };

  const handleClose = () => {
    setSelectedElement(null);
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

          {/* Información de dimensionamiento */}
          {(() => {
            const dimensionInfo = getPipeDimensionInfo(pipe, pipes, radiators);
            return (
              <div style={{ 
                padding: '12px',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '15px',
                border: '2px solid #9C27B0'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#9C27B0' }}>
                  📏 Dimensionamiento
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Radiadores alimentados:</strong> {dimensionInfo.radiatorCount}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Potencia total:</strong> {dimensionInfo.totalPower.toLocaleString()} Kcal/h
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Caudal necesario:</strong> {dimensionInfo.flowRate} L/h
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid #9C27B0',
                  fontWeight: 'bold',
                  color: dimensionInfo.recommendedDiameter === editedValues.diameter ? '#4CAF50' : '#FF6F00'
                }}>
                  Diámetro recomendado: {dimensionInfo.recommendedDiameter} mm
                  {dimensionInfo.recommendedDiameter === editedValues.diameter ? ' ✓' : ' ⚠'}
                </div>
                {dimensionInfo.recommendedDiameter !== editedValues.diameter && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Actual: {editedValues.diameter} mm
                  </div>
                )}
              </div>
            );
          })()}

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
      {/* Botón cerrar (X) */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '5px',
          lineHeight: '1',
          color: '#666',
        }}
        title="Cerrar"
      >
        ×
      </button>

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
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

