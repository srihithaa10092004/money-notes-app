import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Target, TrendingUp, Calendar, Coins, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function GoalBasedCalculator() {
  const [targetAmount, setTargetAmount] = useState(10000000);
  const [duration, setDuration] = useState(15);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  const calculations = useMemo(() => {
    const months = duration * 12;
    const effectiveReturn = inflationAdjusted 
      ? ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100
      : expectedReturn;
    const monthlyRate = effectiveReturn / 100 / 12;

    // Calculate required monthly SIP using the formula:
    // PMT = FV * r / ((1 + r)^n - 1)
    // Where FV = Future Value, r = monthly rate, n = number of months
    const requiredMonthly = monthlyRate > 0
      ? (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
      : targetAmount / months;

    const totalInvestment = requiredMonthly * months;
    const totalReturns = targetAmount - totalInvestment;
    const returnsPercent = (totalReturns / totalInvestment) * 100;

    // Calculate with step-up SIP (10% annual increase)
    const stepUpPercent = 10;
    let stepUpMonthly = 0;
    let tempFV = 0;
    let currentMonthly = 1000; // Start with a guess
    
    // Binary search to find the starting amount for step-up SIP
    let low = 100;
    let high = targetAmount / months;
    
    for (let i = 0; i < 50; i++) {
      currentMonthly = (low + high) / 2;
      tempFV = 0;
      let monthlyContrib = currentMonthly;
      
      for (let year = 1; year <= duration; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthsRemaining = (duration - year) * 12 + (12 - month) + 1;
          tempFV += monthlyContrib * Math.pow(1 + monthlyRate, monthsRemaining);
        }
        monthlyContrib *= (1 + stepUpPercent / 100);
      }
      
      if (Math.abs(tempFV - targetAmount) < 1) break;
      if (tempFV < targetAmount) low = currentMonthly;
      else high = currentMonthly;
    }
    stepUpMonthly = currentMonthly;

    const savingsWithStepUp = requiredMonthly - stepUpMonthly;

    return {
      requiredMonthly: Math.round(requiredMonthly),
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns),
      returnsPercent: Math.round(returnsPercent),
      stepUpMonthly: Math.round(stepUpMonthly),
      savingsWithStepUp: Math.round(savingsWithStepUp),
      dailyAmount: Math.round(requiredMonthly / 30),
      weeklyAmount: Math.round(requiredMonthly / 4),
    };
  }, [targetAmount, duration, expectedReturn, inflationAdjusted, inflationRate]);

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

  const goalPresets = [
    { name: "Emergency Fund", amount: 500000 },
    { name: "Car", amount: 1000000 },
    { name: "Home Down Payment", amount: 3000000 },
    { name: "Child Education", amount: 5000000 },
    { name: "Retirement", amount: 10000000 },
    { name: "Financial Freedom", amount: 50000000 },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Goal-Based Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Presets */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Goals</Label>
          <div className="flex flex-wrap gap-2">
            {goalPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setTargetAmount(preset.amount)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  targetAmount === preset.amount
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target Amount */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Target Amount</Label>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(targetAmount)}
            </span>
          </div>
          <Slider
            value={[targetAmount]}
            onValueChange={([v]) => setTargetAmount(v)}
            min={100000}
            max={100000000}
            step={100000}
            className="py-2"
          />
          <Input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            className="text-right"
          />
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Time to Goal</Label>
            <span className="font-semibold">{duration} years</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
            min={1}
            max={40}
            step={1}
            className="py-2"
          />
        </div>

        {/* Expected Return */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Expected Return (p.a.)</Label>
            <span className="font-semibold">{expectedReturn}%</span>
          </div>
          <Slider
            value={[expectedReturn]}
            onValueChange={([v]) => setExpectedReturn(v)}
            min={1}
            max={30}
            step={0.5}
            className="py-2"
          />
        </div>

        {/* Inflation Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Switch
              checked={inflationAdjusted}
              onCheckedChange={setInflationAdjusted}
            />
            <Label className="text-sm cursor-pointer">Inflation Adjusted</Label>
          </div>
          {inflationAdjusted && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-16 h-8 text-center text-sm"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t">
          <motion.div
            key={calculations.requiredMonthly}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Required Monthly SIP</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculations.requiredMonthly)}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>~₹{calculations.dailyAmount.toLocaleString()}/day</span>
              <span>~₹{calculations.weeklyAmount.toLocaleString()}/week</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                Total Investment
              </div>
              <div className="font-semibold">
                {formatCurrency(calculations.totalInvestment)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                Expected Returns
              </div>
              <div className="font-semibold text-emerald-600">
                {formatCurrency(calculations.totalReturns)}
              </div>
              <div className="text-xs text-emerald-600">
                +{calculations.returnsPercent}%
              </div>
            </div>
          </div>

          {/* Step-up SIP Alternative */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">With 10% Step-up SIP</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(calculations.stepUpMonthly)}
              </span>
              <span className="text-sm text-muted-foreground">starting monthly</span>
            </div>
            {calculations.savingsWithStepUp > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                Save ₹{calculations.savingsWithStepUp.toLocaleString()}/month initially
              </div>
            )}
          </div>

          {inflationAdjusted && (
            <p className="text-xs text-muted-foreground text-center">
              * Calculations adjusted for {inflationRate}% annual inflation
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
