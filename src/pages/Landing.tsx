import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Receipt, PieChart, ArrowRight, Wallet, Globe, Shield } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Users,
      title: "Group Expenses",
      description: "Create groups for trips, roommates, or events and track who owes what effortlessly.",
    },
    {
      icon: Receipt,
      title: "Smart Receipt Scanning",
      description: "Snap a photo of your receipt and let AI automatically extract the details.",
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Travel abroad? Handle expenses in any currency with automatic conversion.",
    },
    {
      icon: PieChart,
      title: "Settlement Optimization",
      description: "Minimize the number of transactions needed to settle up within your group.",
    },
    {
      icon: Wallet,
      title: "Expense Categories",
      description: "Organize expenses by category and gain insights into your spending patterns.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and only visible to your group members.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">The Cash Book</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>Smart Expense Splitting</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Split expenses with{" "}
            <span className="text-primary">friends</span>,{" "}
            not friendships
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The Cash Book makes it easy to track shared expenses, split bills fairly, and settle up — 
            so you can focus on making memories, not doing math.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/auth")}>
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage group expenses
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From weekend trips to shared apartments, The Cash Book has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create a Group", description: "Set up a group for your trip, household, or event." },
              { step: "2", title: "Add Expenses", description: "Log expenses as they happen, or scan receipts for auto-fill." },
              { step: "3", title: "Settle Up", description: "See who owes whom and settle with minimal transactions." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to simplify expense splitting?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of users who have already made group expenses stress-free.
          </p>
          <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/auth")}>
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-md">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">The Cash Book</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Cash Book. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
