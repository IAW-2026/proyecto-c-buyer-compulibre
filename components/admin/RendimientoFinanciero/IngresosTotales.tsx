import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

// Muestra el volumen total historico de dinero procesado en ordenes exitosas.
export default function IngresosTotales({ value }: { value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100 text-green-600 mt-1">
                <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{value}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico generado por todas las órdenes pagadas y entregadas.</p>
            </div>
        </div>
    );
}
