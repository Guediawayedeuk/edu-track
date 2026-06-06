import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FloatingShape = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full opacity-10 ${className}`}
    animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) toast.error("Email ou mot de passe incorrect");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <FloatingShape className="bg-secondary w-64 h-64 -top-20 -left-20" />
      <FloatingShape className="bg-accent w-48 h-48 top-1/3 -right-10" />
      <FloatingShape className="bg-secondary w-32 h-32 bottom-10 left-1/4" />
      <FloatingShape className="bg-accent w-56 h-56 -bottom-20 right-1/4" />
      <FloatingShape className="bg-primary-foreground w-24 h-24 top-20 right-1/3" />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg">
              <GraduationCap className="h-9 w-9 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">EduTrack</h1>
            <p className="mt-1 text-sm text-muted-foreground">Connexion à votre espace</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@ecole.fr"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs text-muted-foreground">Mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 gradient-accent text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {submitting ? "Chargement..." : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Les comptes sont créés par l'administration de l'école.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
