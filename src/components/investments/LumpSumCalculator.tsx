import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Calendar, Percent, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AnimatedCounter } from "./AnimatedCounter";

export function LumpSumCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [duration, setDuration] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const calculations = useMemo(() => {
    const rate = expectedReturn / 100;
    // FV = P × (1 + r)^n
    const futureValue = principal * Math.pow(1 + rate, duration);
    const totalReturns = futureValue - principal;
    const returnPercent = (totalReturns / principal) * 100;

    return {
      futureValue: Math.round(futureValue),
      totalReturns: Math.round(totalReturns),
      returnPercent,
    };
  }, [principal, duration, expectedReturn]);

  const investedPercent = (principal / calculations.futureValue) * 100;
  const returnsPercent = 100 - investedPercent;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          Lump Sum Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Principal Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm">
              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
              Investment Amount
            </Label>
            <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value)))}
                className="w-24 h-7 text-sm border-0 bg-transparent p-0 text-right focus-visible:ring-0"
              />
            </div>
          </div>
          <Slider
            value={[principal]}
            onValueChange={(v) => setPrincipal(v[0])}
            min={1000}
            max={10000000}
            step={1000}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹1,000</span>
            <span>₹1 Cr</span>
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

        {/* Results */}
        <motion.div
          key={`${principal}-${duration}-${expectedReturn}`}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4 space-y-4"
        >
          {/* Visual Breakdown */}
          <div className="space-y-2">
            <div className="h-3 rounded-full overflow-hidden bg-muted flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${investedPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-emerald-500 rounded-l-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${returnsPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="bg-violet-500 rounded-r-full"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Principal ({investedPercent.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Returns ({returnsPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Future Value */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-1">Projected Value</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCounter value={calculations.futureValue} prefix="₹" />
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Invested</span>
              </div>
              <p className="font-semibold text-sm">
                ₹{principal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs text-muted-foreground">Returns</span>
              </div>
              <p className="font-semibold text-sm text-violet-600">
                +₹{calculations.totalReturns.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {calculations.returnPercent.toFixed(0)}% total returns over {duration} years
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
