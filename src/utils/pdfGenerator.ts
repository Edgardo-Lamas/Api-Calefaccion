import jsPDF from 'jspdf';
import { Room } from '../models/Room';
import { Radiator } from '../models/Radiator';
import { PipeSegment } from '../models/PipeSegment';
import { CompanyInfo, Promotion } from '../stores/companyStore';
import { calculateBoilerPower } from './thermalCalculator';

interface MaterialSummary {
  pipes: { diameter: number; length: number }[];
  radiatorCount: number;
  boilerPower: number;
}

const calculateMaterials = (pipes: PipeSegment[], radiators: Radiator[]): MaterialSummary => {
  const pipesByDiameter = new Map<number, number>();

  pipes.forEach((pipe) => {
    // Calcular longitud total del segmento sumando distancias entre puntos consecutivos
    let totalLength = 0;
    for (let i = 0; i < pipe.points.length - 1; i++) {
      const dx = pipe.points[i + 1].x - pipe.points[i].x;
      const dy = pipe.points[i + 1].y - pipe.points[i].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    
    const current = pipesByDiameter.get(pipe.diameter) || 0;
    pipesByDiameter.set(pipe.diameter, current + totalLength);
  });

  const boilerData = calculateBoilerPower(radiators);

  return {
    pipes: Array.from(pipesByDiameter.entries())
      .map(([diameter, length]) => ({ diameter, length: Math.ceil(length / 10) }))
      .sort((a, b) => a.diameter - b.diameter),
    radiatorCount: radiators.length,
    boilerPower: boilerData.recommendedBoilerPower,
  };
};

export const generateQuotePDF = (
  canvasElement: HTMLCanvasElement,
  rooms: Room[],
  radiators: Radiator[],
  pipes: PipeSegment[],
  companyInfo: CompanyInfo,
  activePromotions: Promotion[],
  projectName: string = 'Proyecto de Calefacción'
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // === HEADER CON LOGO Y DATOS DE EMPRESA ===
  if (companyInfo.logo) {
    try {
      doc.addImage(companyInfo.logo, 'PNG', 15, yPosition, 40, 25);
    } catch (e) {
      console.error('Error al agregar logo:', e);
    }
  }

  if (companyInfo.companyName) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.companyName, companyInfo.logo ? 60 : 15, yPosition + 5);
    yPosition += 8;
  }

  if (companyInfo.address || companyInfo.phone || companyInfo.email) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (companyInfo.address) {
      doc.text(companyInfo.address, companyInfo.logo ? 60 : 15, yPosition);
      yPosition += 4;
    }
    if (companyInfo.phone) {
      doc.text(`Tel: ${companyInfo.phone}`, companyInfo.logo ? 60 : 15, yPosition);
      yPosition += 4;
    }
    if (companyInfo.email) {
      doc.text(`Email: ${companyInfo.email}`, companyInfo.logo ? 60 : 15, yPosition);
      yPosition += 4;
    }
    if (companyInfo.website) {
      doc.text(companyInfo.website, companyInfo.logo ? 60 : 15, yPosition);
    }
  }

  yPosition += 15;

  // === TÍTULO DEL PRESUPUESTO ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFontSize(9);
  const today = new Date().toLocaleDateString('es-AR');
  doc.text(`Fecha: ${today}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // === IMAGEN DEL PLANO ===
  const canvasImage = canvasElement.toDataURL('image/png');
  const imgWidth = pageWidth - 30;
  const imgHeight = (canvasElement.height * imgWidth) / canvasElement.width;
  
  if (yPosition + imgHeight > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  doc.addImage(canvasImage, 'PNG', 15, yPosition, imgWidth, imgHeight);
  yPosition += imgHeight + 10;

  // === RESUMEN DE HABITACIONES ===
  if (yPosition + 40 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE HABITACIONES', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  rooms.forEach((room) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    const volume = room.area * room.height;
    const radiatorCount = room.radiatorIds.length;
    const installedPower = radiatorCount > 0
      ? room.radiatorIds.reduce((sum, id) => {
          const rad = radiators.find((r) => r.id === id);
          return sum + (rad?.power || 0);
        }, 0)
      : 0;

    doc.text(`• ${room.name}`, 20, yPosition);
    yPosition += 5;
    doc.text(`  Área: ${room.area} m² × ${room.height} m = ${volume.toFixed(1)} m³`, 25, yPosition);
    yPosition += 4;
    doc.text(`  Factor térmico: ${room.thermalFactor} Kcal/h·m³`, 25, yPosition);
    yPosition += 4;
    doc.text(`  Radiadores instalados: ${radiatorCount} (${installedPower.toLocaleString('es-AR')} Kcal/h)`, 25, yPosition);
    yPosition += 7;
  });

  // === LISTADO DE MATERIALES ===
  if (yPosition + 40 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTADO DE MATERIALES', 15, yPosition);
  yPosition += 8;

  const materials = calculateMaterials(pipes, radiators);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  materials.pipes.forEach(({ diameter, length }) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`• Tubería de ${diameter}mm: ${length} metros`, 20, yPosition);
    yPosition += 5;
  });

  if (yPosition > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }
  doc.text(`• Radiadores: ${materials.radiatorCount} unidades`, 20, yPosition);
  yPosition += 5;

  doc.text(`• Caldera recomendada: ${materials.boilerPower.toLocaleString('es-AR')} Kcal/h`, 20, yPosition);
  yPosition += 10;

  // === PROMOCIONES Y DESCUENTOS ===
  if (activePromotions.length > 0) {
    if (yPosition + 30 > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); // Rojo para destacar
    doc.text('🎁 PROMOCIONES APLICADAS', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    activePromotions.forEach((promo) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`✓ ${promo.name}: ${promo.discount}% de descuento`, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
  }

  // === TOTALES (OPCIONAL - EJEMPLO CON PRECIOS) ===
  // Aquí podrías agregar cálculos de precios si tienes esa información
  // Por ahora dejamos un espacio para que el usuario agregue manualmente

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('_'.repeat(60), 15, yPosition);
  yPosition += 6;
  doc.text('Validez del presupuesto: 30 días', 15, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Presupuesto generado automáticamente. Consulte para más detalles.', 15, yPosition);

  // === DESCARGA ===
  const fileName = `Presupuesto_${projectName.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
