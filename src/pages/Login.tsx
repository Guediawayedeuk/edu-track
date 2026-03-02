import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Shield, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type AppRole = "admin" | "teacher" | "parent";

const roleOptions = [
  { value: "admin" as AppRole, label: "Administration", icon: Shield },
  { value: "teacher" as AppRole, label: "Enseignant", icon: BookOpen },
  { value: "parent" as AppRole, label: "Parent", icon: Users },
];

const FloatingShape = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full opacity-10 ${className}`}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<AppRole>("parent");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, role, firstName, lastName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("Email ou mot de passe incorrect");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Animated floating shapes */}
      <FloatingShape className="bg-secondary w-64 h-64 -top-20 -left-20" />
      <FloatingShape className="bg-accent w-48 h-48 top-1/3 -right-10" />
      <FloatingShape className="bg-secondary w-32 h-32 bottom-10 left-1/4" />
      <FloatingShape className="bg-accent w-56 h-56 -bottom-20 right-1/4" />
      <FloatingShape className="bg-primary-foreground w-24 h-24 top-20 right-1/3" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 md:p-10">
          {/* Header */}
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
            <p className="mt-1 text-sm text-muted-foreground">
              Gestion scolaire intelligente
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <Label htmlFor="firstName" className="text-xs text-muted-foreground">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs text-muted-foreground">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
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

            {/* Password */}
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
            </div>

            {/* Role selection (signup only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Label className="text-xs text-muted-foreground mb-3 block">Choisir votre rôle</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as AppRole)} className="grid grid-cols-3 gap-2">
                  {roleOptions.map((opt) => (
                    <Label
                      key={opt.value}
                      htmlFor={`role-${opt.value}`}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 text-center ${
                        role === opt.value
                          ? "border-secondary bg-secondary/10 shadow-md"
                          : "border-border hover:border-secondary/50"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} id={`role-${opt.value}`} className="sr-only" />
                      <opt.icon className={`h-5 w-5 ${role === opt.value ? "text-secondary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${role === opt.value ? "text-secondary" : "text-muted-foreground"}`}>
                        {opt.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 gradient-accent text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {submitting ? "Chargement..." : isSignUp ? "Créer un compte" : "Se connecter"}
            </Button>
          </form>

          {/* Toggle signup/login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-semibold text-secondary hover:underline"
            >
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
