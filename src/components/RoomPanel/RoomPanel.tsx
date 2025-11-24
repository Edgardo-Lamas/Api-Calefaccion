import React, { useState } from 'react';
import { useElementsStore } from '../../store/useElementsStore';
import { Room } from '../../models/Room';
import { 
  calculateRoomPower, 
  isPowerSufficient, 
  calculateBoilerPower,
  kcalToKw 
} from '../../utils/thermalCalculator';

export const RoomPanel: React.FC = () => {
  const { rooms, radiators, addRoom, updateRoom, removeRoom } = useElementsStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Minimizado por defecto
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  
  const handleCreateRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `Habitación ${rooms.length + 1}`,
      area: 15, // m² por defecto
      height: 2.5, // metros (altura estándar)
      thermalFactor: 50, // Default: 50 Kcal/h·m³
      hasExteriorWall: false, // Por defecto NO (más conservador)
      windowsLevel: 'sin-ventanas', // Por defecto sin ventanas
      radiatorIds: []
    };
    
    addRoom(newRoom);
    setSelectedRoomId(newRoom.id);
    setIsCreatingRoom(false);
  };
  
  const handleDeleteRoom = (roomId: string) => {
    if (confirm('¿Eliminar esta habitación?')) {
      removeRoom(roomId);
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }
    }
  };
  
  // Calcular totales para la caldera
  const boilerCalc = calculateBoilerPower(radiators);
  
  // Si está colapsado, solo mostrar botón flotante
  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 100
        }}
        title="Abrir cálculo de potencia"
      >
        📊
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '320px',
      maxHeight: 'calc(100vh - 100px)',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Cálculo de Potencia
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            color: '#666'
          }}
          title="Minimizar"
        >
          ✕
        </button>
      </div>
      
      {/* Lista de habitaciones */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={handleCreateRoom}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Nueva Habitación
          </button>
        </div>
        
        {rooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#999',
            fontSize: '14px'
          }}>
            No hay habitaciones definidas
          </div>
        ) : (
          rooms.map(room => {
            const powerCheck = isPowerSufficient(room, radiators);
            
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  border: selectedRoomId === room.id ? '2px solid #2196F3' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedRoomId === room.id ? '#E3F2FD' : 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <strong style={{ fontSize: '14px' }}>{room.name}</strong>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '12px',
                      border: 'none',
                      background: '#f44336',
                      color: 'white',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Área: {room.area} m² × {room.height} m = {(room.area * room.height).toFixed(1)} m³</div>
                  <div>Factor: {room.thermalFactor} Kcal/h·m³</div>
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                    <strong>Requerido:</strong> {powerCheck.required.toLocaleString()} Kcal/h
                  </div>
                  {room.radiatorIds.length > 0 ? (
                    <>
                      <div>
                        <strong>Instalado:</strong> {powerCheck.installed.toLocaleString()} Kcal/h
                      </div>
                      <div style={{
                        marginTop: '4px',
                        color: powerCheck.sufficient ? '#4CAF50' : '#f44336',
                        fontWeight: 600
                      }}>
                        {powerCheck.sufficient ? '✓ Suficiente' : '⚠ Insuficiente'} ({powerCheck.percentage}%)
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: '4px', color: '#999', fontSize: '11px' }}>
                      Sin radiadores asignados
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Detalle de habitación seleccionada */}
      {selectedRoom && (
        <div style={{
          padding: '16px',
          borderTop: '2px solid #2196F3',
          backgroundColor: '#f9f9f9'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            Configuración: {selectedRoom.name}
          </h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Nombre:
            </label>
            <input
              type="text"
              value={selectedRoom.name}
              onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Área (m²):
            </label>
            <input
              type="number"
              value={selectedRoom.area}
              onChange={(e) => updateRoom(selectedRoom.id, { area: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              min="1"
              step="0.1"
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Altura (m):
            </label>
            <input
              type="number"
              value={selectedRoom.height}
              onChange={(e) => updateRoom(selectedRoom.id, { height: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              min="2"
              max="4"
              step="0.1"
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Factor térmico:
            </label>
            <select
              value={selectedRoom.thermalFactor}
              onChange={(e) => updateRoom(selectedRoom.id, { thermalFactor: Number(e.target.value) as 40 | 50 | 60 })}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value={40}>40 Kcal/h·m³ (Templado/Edificio)</option>
              <option value={50}>50 Kcal/h·m³ (Normal)</option>
              <option value={60}>60 Kcal/h·m³ (Frío intenso)</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={selectedRoom.hasExteriorWall}
                onChange={(e) => updateRoom(selectedRoom.id, { hasExteriorWall: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              Pared exterior (+15%)
            </label>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Ventanas:
            </label>
            <select
              value={selectedRoom.windowsLevel}
              onChange={(e) => updateRoom(selectedRoom.id, { 
                windowsLevel: e.target.value as 'sin-ventanas' | 'pocas' | 'normales' | 'muchas' 
              })}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="sin-ventanas">Sin ventanas (0%)</option>
              <option value="pocas">Pocas ventanas (+5%)</option>
              <option value="normales">Ventanas normales (+10%)</option>
              <option value="muchas">Muchas ventanas (+20%)</option>
            </select>
          </div>
          
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #ddd',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '4px' }}>
              Radiadores asignados: <strong>{selectedRoom.radiatorIds.length}</strong>
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              (Selecciona radiadores en el canvas para asignarlos)
            </div>
          </div>
        </div>
      )}
      
      {/* Resumen caldera */}
      <div style={{
        padding: '16px',
        borderTop: '2px solid #333',
        backgroundColor: '#263238',
        color: 'white'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          Potencia de Caldera
        </h4>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div>
            Total radiadores: <strong>{boilerCalc.totalRadiatorPower.toLocaleString()} Kcal/h</strong>
          </div>
          <div>
            ({kcalToKw(boilerCalc.totalRadiatorPower)} kW)
          </div>
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid rgba(255,255,255,0.2)',
            fontSize: '13px'
          }}>
            Caldera recomendada: 
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD54F' }}>
              {boilerCalc.recommendedBoilerPower.toLocaleString()} Kcal/h
            </div>
            <div style={{ fontSize: '11px', color: '#B0BEC5' }}>
              ({kcalToKw(boilerCalc.recommendedBoilerPower)} kW)
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#B0BEC5', marginTop: '4px' }}>
            * Trabajando al {boilerCalc.workingPercentage}% de capacidad
          </div>
        </div>
      </div>
    </div>
  );
};
