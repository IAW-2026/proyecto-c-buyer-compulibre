import { Suspense } from "react";
import CartStatusChart from "./CartStatusChart";
import TasaConversion from "./TasaConversion";
import CanceladosManual from "./CanceladosManual";
import RechazosPasarela from "./RechazosPasarela";

// Componente orquestador de la pestana de Analisis de Carritos del dashboard. Muestra metricas de conversion y el grafico de estado.
export default function AnalisisCarritos({
    convertedCarts,
    activeCarts,
    cancelledCarts,
    rejectedCarts,
    conversionRate
}: {
    convertedCarts: number;
    activeCarts: number;
    cancelledCarts: number;
    rejectedCarts: number;
    conversionRate: number;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Análisis de Carritos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Gráfico */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-10 flex flex-col justify-center">
                    <h3 className="text-md font-bold text-gray-900 mb-4 text-center">Distribución Histórica</h3>
                    <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-100 rounded-2xl w-full" />}>
                        <CartStatusChart 
                            converted={convertedCarts}
                            active={activeCarts}
                            cancelled={cancelledCarts}
                            rejected={rejectedCarts}
                        />
                    </Suspense>
                </div>

                {/* Tarjetas de Métricas */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                    <TasaConversion value={`${conversionRate.toFixed(1)}%`} />
                    <CanceladosManual value={cancelledCarts} />
                    <RechazosPasarela value={rejectedCarts} />
                </div>

            </div>
        </div>
    );
}
