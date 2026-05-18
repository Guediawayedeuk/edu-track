import { supabase } from "@/integrations/supabase/client";

export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";
export type PaymentRow = {
  id: string;
  student_id: string;
  amount: number;
  amount_paid: number;
  status: PaymentStatus;
  due_date: string | null;
  paid_date: string | null;
  reference: string | null;
  description: string | null;
  created_at: string;
};

export async function listPayments(student_id?: string) {
  let q = supabase.from("payments").select("*").order("created_at", { ascending: false });
  if (student_id) q = q.eq("student_id", student_id);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PaymentRow[];
}

export async function createPayment(input: { student_id: string; amount: number; due_date?: string | null; description?: string | null; reference?: string | null }) {
  const { error } = await supabase.from("payments").insert(input);
  if (error) throw error;
}

export async function recordPayment(id: string, amount_paid: number) {
  const { error } = await supabase.from("payments").update({ amount_paid }).eq("id", id);
  if (error) throw error;
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}

export function paymentTotals(rows: PaymentRow[]) {
  return rows.reduce(
    (acc, r) => {
      acc.total += Number(r.amount);
      acc.paid += Number(r.amount_paid);
      if (r.status === "pending" || r.status === "overdue") acc.pending += Number(r.amount) - Number(r.amount_paid);
      return acc;
    },
    { total: 0, paid: 0, pending: 0 },
  );
}
