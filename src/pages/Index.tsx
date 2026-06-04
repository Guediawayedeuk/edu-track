import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, LogIn } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="EduTrack background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                <GraduationCap className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h1 className="text-4xl font-extrabold text-primary-foreground lg:text-5xl">
                EduTrack
              </h1>
            </div>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              La plateforme intelligente de gestion scolaire. Suivez les notes,
              gérez les emplois du temps et facilitez la communication école-parents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Unified login card */}
      <section className="mx-auto max-w-lg px-6 -mt-12 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/login" className="group glass-card-hover flex flex-col p-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-accent transition-transform duration-300 group-hover:scale-110">
              <LogIn className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Connexion à votre espace</h3>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Administration, enseignants, parents et élèves : connectez-vous avec votre compte
              pour accéder à votre tableau de bord personnalisé.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary transition-all group-hover:gap-3">
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
