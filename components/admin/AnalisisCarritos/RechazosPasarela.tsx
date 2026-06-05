import { NoSymbolIcon } from "@heroicons/react/24/outline";

export default function RechazosPasarela({ value }: { value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-600">
                    <NoSymbolIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rechazos Pasarela</p>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico de carritos cuya transacción de pago fue rechazada por la entidad emisora o pasarela externa.</p>
        </div>
    );
}
