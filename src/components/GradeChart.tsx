import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const data = [
  { mois: "Sept", moyenne: 12.5 },
  { mois: "Oct", moyenne: 13.2 },
  { mois: "Nov", moyenne: 11.8 },
  { mois: "Déc", moyenne: 14.1 },
  { mois: "Jan", moyenne: 13.7 },
  { mois: "Fév", moyenne: 15.0 },
  { mois: "Mar", moyenne: 14.5 },
];

interface GradeChartProps {
  title?: string;
  chartData?: typeof data;
}

const GradeChart = ({ title = "Évolution des moyennes", chartData = data }: GradeChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMoyenne" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
          <XAxis dataKey="mois" stroke="hsl(215, 15%, 47%)" fontSize={12} />
          <YAxis domain={[0, 20]} stroke="hsl(215, 15%, 47%)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 20%, 88%)",
              borderRadius: "12px",
              boxShadow: "0 4px 24px -4px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="moyenne"
            stroke="hsl(199, 89%, 48%)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMoyenne)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default GradeChart;
