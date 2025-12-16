import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { 
  PlayCircle, Users, Bot, Trophy, Wifi, Monitor, 
  LogIn, Loader2, Spade, Heart, Diamond, Club
} from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    { icon: Users, title: "4 Player Games", description: "Play with friends or bots" },
    { icon: Bot, title: "Smart AI", description: "3 difficulty levels" },
    { icon: Trophy, title: "Track Stats", description: "Level up and compete" },
    { icon: Wifi, title: "Real-time", description: "Instant multiplayer sync" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoading ? (
              <Button disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : isAuthenticated ? (
              <Button onClick={() => setLocation("/profile")} data-testid="button-profile">
                {user?.firstName || "Profile"}
              </Button>
            ) : (
              <Button asChild data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-game-table/20 via-transparent to-game-felt/20" />
          
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {[Spade, Heart, Diamond, Club].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: (i + 1) * 200, rotate: 0 }}
                animate={{ y: 800, rotate: 360 }}
                transition={{ 
                  duration: 15 + i * 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 3
                }}
                className="absolute"
              >
                <Icon className="h-16 w-16" />
              </motion.div>
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.span
                    className="text-primary inline-block"
                    animate={{ 
                      textShadow: [
                        "0 0 10px hsl(var(--primary) / 0.3)",
                        "0 0 20px hsl(var(--primary) / 0.5)",
                        "0 0 10px hsl(var(--primary) / 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Chinese
                  </motion.span>
                  {" "}
                  <motion.span
                    className="text-foreground inline-block"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    Game
                  </motion.span>
                </motion.h1>
              </motion.div>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                A classic 4-player card game. Be the first to empty your hand!
                Play online with friends or challenge AI opponents.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="min-w-40"
                  onClick={() => setLocation("/play?mode=online")}
                  data-testid="button-play-online"
                >
                  <Wifi className="h-5 w-5 mr-2" />
                  Play Online
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="min-w-40"
                  onClick={() => setLocation("/play?mode=local")}
                  data-testid="button-play-local"
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Play vs Bots
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="min-w-40"
                  onClick={() => setLocation("/leaderboard")}
                  data-testid="button-leaderboard"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Leaderboard
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-center mb-8">How to Play</h2>
              <div className="space-y-4">
                {[
                  { num: "1", text: "Each player receives 13 cards from a standard 52-card deck" },
                  { num: "2", text: "Player with 3 of Diamonds starts first and must include it" },
                  { num: "3", text: "Play singles, doubles, triples, or 5-card poker hands" },
                  { num: "4", text: "Beat the previous play with a stronger hand of the same type" },
                  { num: "5", text: "First player to empty their hand wins!" },
                ].map((step, index) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-card border border-card-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      {step.num}
                    </div>
                    <p className="text-muted-foreground pt-1">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-game-table to-game-felt text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
              <p className="mb-8 opacity-80 max-w-md mx-auto">
                Join now and start playing against friends or AI opponents!
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setLocation("/play?mode=online")}
                data-testid="button-start-playing"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Playing
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Chinese Card Game - A Classic 4-Player Experience</p>
        </div>
      </footer>
    </div>
  );
}
