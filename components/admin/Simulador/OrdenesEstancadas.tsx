import { ClockIcon } from "@heroicons/react/24/outline";

// Tarjeta que alerta sobre ordenes en transito que llevan mas de 5 dias sin actualizar su estado.
export default function OrdenesEstancadas({ value }: { value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 text-orange-600">
                    <ClockIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Órdenes Estancadas</p>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-500 mt-2 leading-snug">Compras pagadas que el vendedor aún no ha despachado.</p>
        </div>
    );
}
