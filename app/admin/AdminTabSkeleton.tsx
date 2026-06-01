export default function AdminTabSkeleton() {
    return (
        <div className="animate-pulse space-y-6 w-full">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-32 bg-gray-200 rounded-2xl border border-gray-100"></div>
                <div className="h-32 bg-gray-200 rounded-2xl border border-gray-100"></div>
                <div className="h-32 bg-gray-200 rounded-2xl border border-gray-100"></div>
                <div className="h-32 bg-gray-200 rounded-2xl border border-gray-100"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl border border-gray-100 mt-6"></div>
        </div>
    );
}
