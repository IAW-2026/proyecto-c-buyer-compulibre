import BuyerSearchBar from "./BuyerSearchBar";
import BuyerTable from "./BuyerTable";
import { BuyerProfile } from "@prisma/client";

export default function Compradores({
    buyers,
    totalBuyersCount,
    adminIds,
    page,
    search,
    skip,
    take
}: {
    buyers: BuyerProfile[];
    totalBuyersCount: number;
    adminIds: string[];
    page: number;
    search: string;
    skip: number;
    take: number;
}) {
    return (
        <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Listado de Compradores</h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Total de perfiles registrados: {totalBuyersCount}</p>
                </div>
                
                <BuyerSearchBar defaultValue={search} />
            </div>

            <BuyerTable 
                buyers={buyers} 
                totalBuyersCount={totalBuyersCount} 
                adminIds={adminIds} 
                page={page} 
                search={search} 
                skip={skip} 
                take={take} 
            />

        </div>
    );
}
