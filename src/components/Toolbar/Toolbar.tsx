import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';

export const Toolbar = () => {
  const { tool, setTool } = useToolsStore();
  const { clearAll, tempPipe, finishPipe } = useElementsStore();

  const handleFinishPipe = () => {
    if (tempPipe) {
      // Usar el último punto como punto final
      const lastPoint = tempPipe.points[tempPipe.points.length - 1];
      finishPipe(tempPipe.id, lastPoint);
    }
  };

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
        <button
          onClick={handleFinishPipe}
          disabled={!tempPipe}
          style={{
            backgroundColor: tempPipe ? '#2196F3' : '#e0e0e0',
            color: 'white',
            padding: '8px 16px',
            border: '1px solid #ccc',
            cursor: tempPipe ? 'pointer' : 'not-allowed',
            opacity: tempPipe ? 1 : 0.6,
          }}
        >
          Finalizar Tubería
        </button>
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
