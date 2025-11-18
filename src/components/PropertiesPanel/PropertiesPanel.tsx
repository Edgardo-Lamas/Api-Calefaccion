import { useState, useEffect } from 'react';
import { useElementsStore } from '../../store/useElementsStore';

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
      <div style={{ 
        width: '300px', 
        padding: '20px',
        borderLeft: '1px solid #ccc',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
      }}>
        <h3 style={{ marginTop: 0 }}>Propiedades</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
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
          <h3 style={{ marginTop: 0, color: '#333' }}>🔲 Radiador</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Potencia (W)
            </label>
            <input
              type="number"
              value={editedValues.power || 0}
              onChange={(e) => handleChange('power', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Ancho (px)
            </label>
            <input
              type="number"
              value={editedValues.width || 0}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Alto (px)
            </label>
            <input
              type="number"
              value={editedValues.height || 0}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
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

    if (selectedElement.type === 'boiler') {
      return (
        <>
          <h3 style={{ marginTop: 0, color: '#333' }}>🔥 Caldera</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Potencia (Kcal/h)
            </label>
            <input
              type="number"
              value={editedValues.power || 0}
              onChange={(e) => handleChange('power', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <small style={{ color: '#666', fontSize: '11px' }}>
              ≈ {((editedValues.power || 0) / 860).toFixed(1)} kW
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Tamaño (px)
            </label>
            <input
              type="number"
              value={editedValues.width || 0}
              onChange={(e) => {
                handleChange('width', Number(e.target.value));
                handleChange('height', Number(e.target.value)); // Mantener cuadrado
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
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
          <h3 style={{ marginTop: 0, color: '#333' }}>
            {pipe.pipeType === 'supply' ? '🔴 Tubería IDA' : '🔵 Tubería RETORNO'}
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Diámetro (mm)
            </label>
            <select
              value={editedValues.diameter || 16}
              onChange={(e) => handleChange('diameter', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value={12}>12 mm</option>
              <option value={16}>16 mm</option>
              <option value={20}>20 mm</option>
              <option value={25}>25 mm</option>
              <option value={32}>32 mm</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
              Material
            </label>
            <select
              value={editedValues.material || 'PEX'}
              onChange={(e) => handleChange('material', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
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
    <div style={{ 
      width: '300px', 
      padding: '20px',
      borderLeft: '1px solid #ccc',
      backgroundColor: '#f5f5f5',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {renderProperties()}

      <div style={{ 
        marginTop: 'auto',
        paddingTop: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Guardar
        </button>
        <button
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

