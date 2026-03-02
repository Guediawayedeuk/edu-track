import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Shield, BookOpen, Users, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const roles = [
  {
    title: "Administration",
    description: "Gérez les élèves, enseignants, classes et suivez les performances de votre établissement.",
    icon: Shield,
    path: "/admin",
    gradient: "gradient-primary",
  },
  {
    title: "Enseignant",
    description: "Ajoutez des notes, gérez les absences et suivez vos classes au quotidien.",
    icon: BookOpen,
    path: "/teacher",
    gradient: "gradient-accent",
  },
  {
    title: "Parent / Élève",
    description: "Consultez les notes, bulletins et emplois du temps en temps réel.",
    icon: Users,
    path: "/parent",
    gradient: "gradient-success",
  },
];

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

      {/* Role Cards */}
      <section className="mx-auto max-w-6xl px-6 -mt-12 relative z-10 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
            >
              <Link
                to={role.path}
                className="group glass-card-hover flex flex-col p-8 h-full"
              >
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${role.gradient} transition-transform duration-300 group-hover:scale-110`}>
                  <role.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{role.title}</h3>
                <p className="mb-6 flex-1 text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary transition-all group-hover:gap-3">
                  Accéder
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
