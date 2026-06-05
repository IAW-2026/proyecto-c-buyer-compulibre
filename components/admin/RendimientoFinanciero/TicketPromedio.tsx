import { ChartBarIcon } from "@heroicons/react/24/outline";

// Calcula y muestra el valor promedio gastado por orden exitosa.
export default function TicketPromedio({ value }: { value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-600 mt-1">
                <ChartBarIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Promedio</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{value}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-snug">Monto promedio histórico que gasta un usuario al concretar una compra.</p>
            </div>
        </div>
    );
}
