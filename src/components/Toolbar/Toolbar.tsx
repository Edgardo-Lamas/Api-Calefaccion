import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';

export const Toolbar = () => {
  const { tool, setTool, pipeType, setPipeType } = useToolsStore();
  const { clearAll } = useElementsStore();

  return (
    <div style={{ 
      padding: '10px', 
      borderBottom: '1px solid #ccc',
      display: 'flex',
      gap: '10px'
    }}>
      <button
        onClick={() => setTool('select')}
        style={{
          backgroundColor: tool === 'select' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'select' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Seleccionar
      </button>
      <button
        onClick={() => setTool('radiator')}
        style={{
          backgroundColor: tool === 'radiator' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'radiator' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Radiador
      </button>
      <button
        onClick={() => setTool('boiler')}
        style={{
          backgroundColor: tool === 'boiler' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'boiler' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Caldera
      </button>
      <button
        onClick={() => setTool('pipe')}
        style={{
          backgroundColor: tool === 'pipe' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'pipe' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Tubería
      </button>
      {tool === 'pipe' && (
        <>
          <button
            onClick={() => setPipeType('supply')}
            style={{
              backgroundColor: pipeType === 'supply' ? '#D32F2F' : '#f0f0f0',
              color: pipeType === 'supply' ? 'white' : 'black',
              padding: '8px 16px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: pipeType === 'supply' ? 'bold' : 'normal',
            }}
          >
            🔴 IDA
          </button>
          <button
            onClick={() => setPipeType('return')}
            style={{
              backgroundColor: pipeType === 'return' ? '#29B6F6' : '#f0f0f0',
              color: pipeType === 'return' ? 'white' : 'black',
              padding: '8px 16px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: pipeType === 'return' ? 'bold' : 'normal',
            }}
          >
            🔵 RETORNO
          </button>
        </>
      )}
      <div style={{ flex: 1 }} />
      <button
        onClick={() => {
          if (confirm('¿Estás seguro de que quieres borrar todo el proyecto?')) {
            clearAll();
          }
        }}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Limpiar Todo
      </button>
    </div>
  );
};
