import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Coins, Award } from "lucide-react";
import type { Investment } from "./InvestmentCard";

type QuickStatsGridProps = {
  investments: Investment[];
};

export function QuickStatsGrid({ investments }: QuickStatsGridProps) {
  if (investments.length === 0) return null;

  // Find best performer
  const bestPerformer = investments.reduce((best, inv) => {
    const returnsPct = inv.invested_amount > 0 
      ? ((inv.current_value - inv.invested_amount) / inv.invested_amount) * 100 
      : 0;
    const bestReturnsPct = best.invested_amount > 0
      ? ((best.current_value - best.invested_amount) / best.invested_amount) * 100
      : 0;
    return returnsPct > bestReturnsPct ? inv : best;
  }, investments[0]);

  const bestReturnsPercent = bestPerformer.invested_amount > 0
    ? ((bestPerformer.current_value - bestPerformer.invested_amount) / bestPerformer.invested_amount) * 100
    : 0;

  // Find worst performer
  const worstPerformer = investments.reduce((worst, inv) => {
    const returnsPct = inv.invested_amount > 0 
      ? ((inv.current_value - inv.invested_amount) / inv.invested_amount) * 100 
      : 0;
    const worstReturnsPct = worst.invested_amount > 0
      ? ((worst.current_value - worst.invested_amount) / worst.invested_amount) * 100
      : 0;
    return returnsPct < worstReturnsPct ? inv : worst;
  }, investments[0]);

  const worstReturnsPercent = worstPerformer.invested_amount > 0
    ? ((worstPerformer.current_value - worstPerformer.invested_amount) / worstPerformer.invested_amount) * 100
    : 0;

  // Count unique types
  const uniqueTypes = new Set(investments.map(inv => inv.type)).size;

  const stats = [
    {
      label: "Holdings",
      value: investments.length.toString(),
      icon: Coins,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Asset Types",
      value: uniqueTypes.toString(),
      icon: Target,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      label: "Top Performer",
      value: `${bestReturnsPercent >= 0 ? "+" : ""}${bestReturnsPercent.toFixed(1)}%`,
      subValue: bestPerformer.name,
      icon: Award,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Needs Attention",
      value: `${worstReturnsPercent >= 0 ? "+" : ""}${worstReturnsPercent.toFixed(1)}%`,
      subValue: worstPerformer.name,
      icon: worstReturnsPercent >= 0 ? TrendingUp : TrendingDown,
      color: worstReturnsPercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="bg-card border rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
          {stat.subValue && (
            <p className="text-xs text-muted-foreground truncate">{stat.subValue}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
