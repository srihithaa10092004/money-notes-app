import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { Investment } from "./InvestmentCard";

type PortfolioAllocationChartProps = {
  investments: Investment[];
};

const typeColors: Record<string, string> = {
  sip: "#3b82f6",
  etf: "#a855f7",
  stock: "#f59e0b",
  mutual_fund: "#06b6d4",
  other: "#6b7280",
};

const typeLabels: Record<string, string> = {
  sip: "SIP",
  etf: "ETF",
  stock: "Stocks",
  mutual_fund: "Mutual Funds",
  other: "Other",
};

export function PortfolioAllocationChart({ investments }: PortfolioAllocationChartProps) {
  // Group by type and sum current values
  const allocationData = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.type === inv.type);
    if (existing) {
      existing.value += Number(inv.current_value);
    } else {
      acc.push({
        type: inv.type,
        name: typeLabels[inv.type] || inv.type,
        value: Number(inv.current_value),
        color: typeColors[inv.type] || typeColors.other,
      });
    }
    return acc;
  }, [] as { type: string; name: string; value: number; color: string }[]);

  const total = allocationData.reduce((sum, item) => sum + item.value, 0);

  if (allocationData.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-card border rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Portfolio Allocation</h3>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {allocationData.map((item) => (
            <div key={item.type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
