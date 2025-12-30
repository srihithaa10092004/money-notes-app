import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PiggyBank, Calendar, TrendingUp, Coins, BadgePercent } from "lucide-react";
import { motion } from "framer-motion";

export function RDCalculator() {
  const [monthlyDeposit, setMonthlyDeposit] = useState(10000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState<"monthly" | "quarterly">("quarterly");

  const calculations = useMemo(() => {
    const n = compoundingFrequency === "monthly" ? 12 : 4;
    const r = interestRate / 100;
    const months = tenure * 12;
    
    // RD Maturity Formula: M = P * [(1 + r/n)^(nt) - 1] / (1 - (1 + r/n)^(-1/3))
    // Simplified calculation for quarterly compounding
    let maturityAmount = 0;
    
    if (compoundingFrequency === "quarterly") {
      // For quarterly compounding, each deposit earns interest for remaining quarters
      for (let i = 1; i <= months; i++) {
        const remainingMonths = months - i + 1;
        const quarters = remainingMonths / 3;
        maturityAmount += monthlyDeposit * Math.pow(1 + r / 4, quarters);
      }
    } else {
      // For monthly compounding
      for (let i = 1; i <= months; i++) {
        const remainingMonths = months - i + 1;
        maturityAmount += monthlyDeposit * Math.pow(1 + r / 12, remainingMonths);
      }
    }

    const totalDeposit = monthlyDeposit * months;
    const totalInterest = maturityAmount - totalDeposit;
    const effectiveReturn = (totalInterest / totalDeposit) * 100;

    return {
      maturityAmount: Math.round(maturityAmount),
      totalDeposit: Math.round(totalDeposit),
      totalInterest: Math.round(totalInterest),
      effectiveReturn: effectiveReturn.toFixed(1),
      monthlyContribution: monthlyDeposit,
    };
  }, [monthlyDeposit, interestRate, tenure, compoundingFrequency]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Calculate breakdown for visualization
  const depositPercent = (calculations.totalDeposit / calculations.maturityAmount) * 100;
  const interestPercent = (calculations.totalInterest / calculations.maturityAmount) * 100;

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-background to-teal-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiggyBank className="h-5 w-5 text-teal-600" />
          RD Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Monthly Deposit */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Monthly Deposit</Label>
            <span className="font-semibold text-teal-600">
              {formatCurrency(monthlyDeposit)}
            </span>
          </div>
          <Slider
            value={[monthlyDeposit]}
            onValueChange={([v]) => setMonthlyDeposit(v)}
            min={500}
            max={100000}
            step={500}
            className="py-2"
          />
          <Input
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            className="text-right"
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Interest Rate (p.a.)</Label>
            <span className="font-semibold">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([v]) => setInterestRate(v)}
            min={4}
            max={9}
            step={0.1}
            className="py-2"
          />
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Tenure</Label>
            <span className="font-semibold">{tenure} years</span>
          </div>
          <Slider
            value={[tenure]}
            onValueChange={([v]) => setTenure(v)}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
        </div>

        {/* Compounding Frequency */}
        <div className="space-y-2">
          <Label className="text-sm">Compounding</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setCompoundingFrequency("quarterly")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                compoundingFrequency === "quarterly"
                  ? "bg-teal-600 text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setCompoundingFrequency("monthly")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                compoundingFrequency === "monthly"
                  ? "bg-teal-600 text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t">
          <motion.div
            key={calculations.maturityAmount}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-600/5 border border-teal-500/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-teal-600" />
              <span className="text-sm text-muted-foreground">Maturity Amount</span>
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {formatCurrency(calculations.maturityAmount)}
            </div>
          </motion.div>

          {/* Visual Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Principal vs Interest</span>
              <span>{depositPercent.toFixed(0)}% / {interestPercent.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-muted flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${depositPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-teal-600 h-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${interestPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="bg-emerald-500 h-full"
              />
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-600" />
                <span className="text-muted-foreground">Deposits</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Interest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                Total Deposits
              </div>
              <div className="font-semibold">
                {formatCurrency(calculations.totalDeposit)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                Interest Earned
              </div>
              <div className="font-semibold text-emerald-600">
                {formatCurrency(calculations.totalInterest)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Effective Return</span>
            </div>
            <span className="font-semibold text-emerald-600">
              +{calculations.effectiveReturn}%
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * {compoundingFrequency === "quarterly" ? "Quarterly" : "Monthly"} compounding applied
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
