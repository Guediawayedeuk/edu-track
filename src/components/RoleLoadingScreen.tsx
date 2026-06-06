import { motion } from "framer-motion";
import { GraduationCap, Loader2 } from "lucide-react";

const RoleLoadingScreen = ({ message = "Détection de votre espace..." }: { message?: string }) => (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 glass-card p-8 md:p-10 text-center max-w-sm mx-4"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg"
      >
        <GraduationCap className="h-9 w-9 text-accent-foreground" />
      </motion.div>
      <h2 className="text-lg font-bold text-foreground mb-2">EduTrack</h2>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <div className="flex items-center justify-center gap-2 text-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">Veuillez patienter</span>
      </div>
    </motion.div>
  </div>
);

export default RoleLoadingScreen;
