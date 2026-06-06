import { motion } from "framer-motion";
import { ShieldAlert, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NoRole = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card p-8 md:p-10 max-w-md mx-4 text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-9 w-9" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Aucun rôle attribué</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Votre compte <span className="font-medium text-foreground">{user?.email}</span> est bien connecté,
          mais aucun rôle (Admin, Enseignant, Parent) ne lui a été attribué par l'administration.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-left text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2 font-medium text-foreground mb-1">
            <Mail className="h-4 w-4" /> Contactez votre administrateur
          </div>
          Demandez à l'administration de l'école d'attribuer un rôle à votre compte pour accéder à votre espace.
        </div>
        <Button onClick={signOut} variant="outline" className="w-full">
          <LogOut className="h-4 w-4" /> Se déconnecter
        </Button>
      </motion.div>
    </div>
  );
};

export default NoRole;
