import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Percent,
  Euro,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator
} from 'lucide-react';
import type { PaymentGateway } from '../../types';

interface CommissionPeriod {
  start_date: string;
  end_date: string;
  percentage?: number;
  fixed?: number;
  description?: string;
}

interface CommissionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gatewayId: string, periods: CommissionPeriod[]) => Promise<void>;
  gateway: PaymentGateway | null;
}

export default function CommissionConfigModal({ 
  isOpen, 
  onClose, 
  onSave, 
  gateway 
}: CommissionConfigModalProps) {
  const [periods, setPeriods] = useState<CommissionPeriod[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (gateway) {
      // Cargar períodos existentes o crear uno por defecto
      if (gateway.commission_periods && gateway.commission_periods.length > 0) {
        setPeriods(gateway.commission_periods);
      } else {
        // Crear período por defecto basado en la configuración actual
        setPeriods([{
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
          percentage: gateway.commission_percentage || 0,
          fixed: gateway.commission_fixed || 0,
          description: 'Configuración estándar'
        }]);
      }
    }
  }, [gateway]);

  const addPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const startDate = lastPeriod 
      ? new Date(new Date(lastPeriod.end_date).getTime() + 24 * 60 * 60 * 1000)
      : new Date();
    
    const newPeriod: CommissionPeriod = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date(startDate.getFullYear(), 11, 31).toISOString().split('T')[0],
      percentage: gateway?.commission_percentage || 0,
      fixed: gateway?.commission_fixed || 0,
      description: ''
    };

    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (index: number) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((_, i) => i !== index));
    }
  };

  const updatePeriod = (index: number, field: keyof CommissionPeriod, value: any) => {
    const updatedPeriods = periods.map((period, i) => 
      i === index ? { ...period, [field]: value } : period
    );
    setPeriods(updatedPeriods);
    
    // Limpiar errores relacionados
    if (errors[`${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`${index}_${field}`]: '' }));
    }
  };

  const validatePeriods = () => {
    const newErrors: {[key: string]: string} = {};

    periods.forEach((period, index) => {
      if (!period.start_date) {
        newErrors[`${index}_start_date`] = 'Fecha de inicio requerida';
      }
      if (!period.end_date) {
        newErrors[`${index}_end_date`] = 'Fecha de fin requerida';
      }
      if (period.start_date && period.end_date && period.start_date >= period.end_date) {
        newErrors[`${index}_dates`] = 'La fecha de inicio debe ser anterior a la fecha de fin';
      }
      if ((period.percentage || 0) < 0 || (period.percentage || 0) > 100) {
        newErrors[`${index}_percentage`] = 'El porcentaje debe estar entre 0 y 100';
      }
      if ((period.fixed || 0) < 0) {
        newErrors[`${index}_fixed`] = 'La comisión fija no puede ser negativa';
      }
    });

    // Verificar solapamientos
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const period1 = periods[i];
        const period2 = periods[j];
        
        if (period1.start_date && period1.end_date && period2.start_date && period2.end_date) {
          const start1 = new Date(period1.start_date);
          const end1 = new Date(period1.end_date);
          const start2 = new Date(period2.start_date);
          const end2 = new Date(period2.end_date);
          
          if ((start1 <= end2 && end1 >= start2)) {
            newErrors[`overlap_${i}_${j}`] = `Los períodos ${i + 1} y ${j + 1} se solapan`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateExampleCommission = (period: CommissionPeriod, amount: number = 100) => {
    const percentageCommission = amount * (period.percentage || 0) / 100;
    const fixedCommission = period.fixed || 0;
    return percentageCommission + fixedCommission;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePeriods() || !gateway) return;

    setIsSubmitting(true);
    try {
      await onSave(gateway.id, periods);
      onClose();
    } catch (error) {
      console.error('Error saving commission periods:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !gateway) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Calculator className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Configuración de Comisiones</h2>
                <p className="text-green-100">{gateway.name} - Períodos de comisión inteligente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la Pasarela */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">Pasarela: {gateway.name}</h4>
                <p className="text-sm text-blue-700">
                  Tipo: {gateway.type.toUpperCase()} • Estado: {gateway.status}
                </p>
              </div>
            </div>
          </div>

          {/* Períodos de Comisión */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Períodos de Comisión</h3>
              <button
                type="button"
                onClick={addPeriod}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Período
              </button>
            </div>

            {periods.map((period, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Período {index + 1}</h4>
                  {periods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePeriod(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={period.start_date}
                      onChange={(e) => updatePeriod(index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors[`${index}_start_date`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${index}_start_date`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      value={period.end_date}
                      onChange={(e) => updatePeriod(index, 'end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors[`${index}_end_date`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${index}_end_date`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comisión Porcentual (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={period.percentage || ''}
                        onChange={(e) => updatePeriod(index, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors[`${index}_percentage`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${index}_percentage`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comisión Fija (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={period.fixed || ''}
                        onChange={(e) => updatePeriod(index, 'fixed', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors[`${index}_fixed`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${index}_fixed`]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={period.description || ''}
                    onChange={(e) => updatePeriod(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Promoción de lanzamiento, Tarifa estándar..."
                  />
                </div>

                {/* Ejemplo de Cálculo */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2">Ejemplo de Cálculo (€100)</h5>
                  <div className="text-sm text-gray-600">
                    <p>Comisión porcentual: €{((period.percentage || 0) * 100 / 100).toFixed(2)}</p>
                    <p>Comisión fija: €{(period.fixed || 0).toFixed(2)}</p>
                    <p className="font-medium text-gray-800 border-t pt-2 mt-2">
                      Total: €{calculateExampleCommission(period, 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {errors[`${index}_dates`] && (
                  <p className="text-sm text-red-600">{errors[`${index}_dates`]}</p>
                )}
              </div>
            ))}

            {/* Errores de solapamiento */}
            {Object.entries(errors).filter(([key]) => key.startsWith('overlap_')).map(([key, error]) => (
              <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Información Importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Información Importante</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Los períodos no pueden solaparse entre sí</li>
                  <li>• Las comisiones se calculan automáticamente según la fecha de transacción</li>
                  <li>• Si no hay período aplicable, se usa la configuración estándar</li>
                  <li>• Los cambios afectan solo a transacciones futuras</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || periods.length === 0}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}