import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, PiggyBank, Calendar, Percent, IndianRupee, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AnimatedCounter } from "./AnimatedCounter";

export function SIPCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [duration, setDuration] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [showRealReturns, setShowRealReturns] = useState(false);

  const calculations = useMemo(() => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = duration * 12;
    const totalInvested = monthlyAmount * months;
    
    // FV = P × ((1 + r)^n – 1) / r × (1 + r)
    const futureValue = monthlyAmount * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalReturns = futureValue - totalInvested;
    const returnPercent = (totalReturns / totalInvested) * 100;

    // Inflation-adjusted (real) values
    const inflationFactor = Math.pow(1 + inflationRate / 100, duration);
    const realFutureValue = futureValue / inflationFactor;
    const realTotalReturns = realFutureValue - totalInvested;
    const realReturnPercent = (realTotalReturns / totalInvested) * 100;

    return {
      futureValue: Math.round(futureValue),
      totalInvested,
      totalReturns: Math.round(totalReturns),
      returnPercent,
      realFutureValue: Math.round(realFutureValue),
      realTotalReturns: Math.round(realTotalReturns),
      realReturnPercent,
    };
  }, [monthlyAmount, duration, expectedReturn, inflationRate]);

  const displayValues = showRealReturns
    ? {
        futureValue: calculations.realFutureValue,
        totalReturns: calculations.realTotalReturns,
        returnPercent: calculations.realReturnPercent,
      }
    : {
        futureValue: calculations.futureValue,
        totalReturns: calculations.totalReturns,
        returnPercent: calculations.returnPercent,
      };

  const investedPercent = (calculations.totalInvested / displayValues.futureValue) * 100;
  const returnsPercent = 100 - investedPercent;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Calculator className="h-4 w-4 text-violet-500" />
          </div>
          SIP Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Monthly Investment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm">
              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
              Monthly Investment
            </Label>
            <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <Input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Math.max(500, Number(e.target.value)))}
                className="w-20 h-7 text-sm border-0 bg-transparent p-0 text-right focus-visible:ring-0"
              />
            </div>
          </div>
          <Slider
            value={[monthlyAmount]}
            onValueChange={(v) => setMonthlyAmount(v[0])}
            min={500}
            max={100000}
            step={500}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹500</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Investment Period
            </Label>
            <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Math.min(40, Number(e.target.value))))}
                className="w-12 h-7 text-sm border-0 bg-transparent p-0 text-right focus-visible:ring-0"
              />
              <span className="text-sm text-muted-foreground">years</span>
            </div>
          </div>
          <Slider
            value={[duration]}
            onValueChange={(v) => setDuration(v[0])}
            min={1}
            max={40}
            step={1}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 year</span>
            <span>40 years</span>
          </div>
        </div>

        {/* Expected Return */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm">
              <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              Expected Return (p.a.)
            </Label>
            <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
              <Input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-12 h-7 text-sm border-0 bg-transparent p-0 text-right focus-visible:ring-0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <Slider
            value={[expectedReturn]}
            onValueChange={(v) => setExpectedReturn(v[0])}
            min={1}
            max={30}
            step={0.5}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Inflation Adjustment Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <div>
              <Label className="text-sm font-medium">Inflation Adjusted</Label>
              <p className="text-xs text-muted-foreground">Show real returns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showRealReturns && (
              <div className="flex items-center gap-1 bg-background rounded-lg px-2 py-0.5">
                <Input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Math.min(20, Number(e.target.value))))}
                  className="w-10 h-6 text-xs border-0 bg-transparent p-0 text-right focus-visible:ring-0"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            )}
            <Switch checked={showRealReturns} onCheckedChange={setShowRealReturns} />
          </div>
        </div>

        {/* Results */}
        <motion.div
          key={`${monthlyAmount}-${duration}-${expectedReturn}-${showRealReturns}-${inflationRate}`}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-indigo-500/10 p-4 space-y-4"
        >
          {showRealReturns && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-orange-600 bg-orange-500/10 rounded-full px-3 py-1 w-fit mx-auto">
              <TrendingDown className="h-3 w-3" />
              Inflation Adjusted @ {inflationRate}%
            </div>
          )}

          {/* Visual Breakdown */}
          <div className="space-y-2">
            <div className="h-3 rounded-full overflow-hidden bg-muted flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, investedPercent)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-violet-500 rounded-l-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, returnsPercent)}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="bg-emerald-500 rounded-r-full"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Invested ({Math.max(0, investedPercent).toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Returns ({Math.max(0, returnsPercent).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Future Value */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-1">
              {showRealReturns ? "Real Value (Today's Money)" : "Projected Value"}
            </p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCounter value={displayValues.futureValue} prefix="₹" />
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <PiggyBank className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs text-muted-foreground">Invested</span>
              </div>
              <p className="font-semibold text-sm">
                ₹{calculations.totalInvested.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{showRealReturns ? "Real Returns" : "Returns"}</span>
              </div>
              <p className={`font-semibold text-sm ${displayValues.totalReturns >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {displayValues.totalReturns >= 0 ? '+' : ''}₹{displayValues.totalReturns.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {displayValues.returnPercent.toFixed(0)}% {showRealReturns ? "real" : "total"} returns over {duration} years
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
