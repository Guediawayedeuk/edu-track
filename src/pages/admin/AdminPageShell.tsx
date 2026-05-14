import { ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const AdminPageShell = ({ title, subtitle, actions, children }: Props) => (
  <DashboardLayout role="admin" userName="M. Directeur">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </motion.div>
    {children}
  </DashboardLayout>
);

export default AdminPageShell;
