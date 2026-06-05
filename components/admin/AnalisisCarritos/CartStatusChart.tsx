"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CartStatusChartProps {
  converted: number;
  active: number;
  cancelled: number;
  rejected: number;
}

// Renderiza un grafico de rosquilla mostrando la distribucion del estado de todos los carritos, utilizando la libreria de terceros "recharts".
export default function CartStatusChart({
  converted,
  active,
  cancelled,
  rejected,
}: CartStatusChartProps) {
  const data = [
    { name: "Convertidos", value: converted, color: "#10B981" }, // emerald-500
    { name: "Activos", value: active, color: "#F59E0B" }, // amber-500
    { name: "Cancelados", value: cancelled, color: "#3B82F6" }, // blue-500
    { name: "Rechazados", value: rejected, color: "#EF4444" }, // red-500
  ].filter((item) => item.value > 0); // Hide zero values

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        No hay datos de carritos para mostrar.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | string | readonly (number | string)[] | undefined) => [`${value ?? 0} carritos`, 'Cantidad']}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' 
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
