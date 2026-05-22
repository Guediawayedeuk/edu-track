import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Send, Plus, Mail, MailOpen, Search, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { listMyMessages, sendMessage, markMessageRead, listContacts, type Message } from "@/lib/api/messages";

const MessagesPage = () => {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const msgsQ = useQuery({ queryKey: ["my-messages"], queryFn: listMyMessages });
  const contactsQ = useQuery({ queryKey: ["contacts"], queryFn: listContacts });

  const [active, setActive] = useState<Message | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ recipient_id: "", subject: "", body: "" });

  // Filters
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (active && !active.read_at && active.recipient_id === user?.id) {
      markMessageRead(active.id).then(() => qc.invalidateQueries({ queryKey: ["my-messages"] }));
    }
  }, [active, user, qc]);

  const filteredMsgs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (msgsQ.data ?? []).filter((m) => {
      if (studentFilter !== "all" && m.student_id !== studentFilter) return false;
      if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(m.created_at) > new Date(dateTo + "T23:59:59")) return false;
      if (unreadOnly && (m.read_at || m.recipient_id !== user?.id)) return false;
      if (q) {
        const contact = contactsQ.data?.find((c) => c.user_id === (m.sender_id === user?.id ? m.recipient_id : m.sender_id));
        const hay = `${m.subject ?? ""} ${m.body} ${contact?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [msgsQ.data, search, studentFilter, dateFrom, dateTo, unreadOnly, contactsQ.data, user]);

  const conversations = useMemo(() => {
    const map = new Map<string, Message[]>();
    filteredMsgs.forEach((m) => {
      const other = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
      if (!map.has(other)) map.set(other, []);
      map.get(other)!.push(m);
    });
    return Array.from(map.entries()).map(([uid, msgs]) => ({
      uid,
      latest: msgs[0],
      unread: msgs.filter((m) => !m.read_at && m.recipient_id === user?.id).length,
      contact: contactsQ.data?.find((c) => c.user_id === uid),
    }));
  }, [filteredMsgs, contactsQ.data, user]);

  const studentOptions = useMemo(() => {
    const set = new Map<string, true>();
    (msgsQ.data ?? []).forEach((m) => { if (m.student_id) set.set(m.student_id, true); });
    return Array.from(set.keys());
  }, [msgsQ.data]);

  const send = async () => {
    if (!form.recipient_id || !form.body.trim()) { toast.error("Destinataire et message requis"); return; }
    try {
      await sendMessage(form);
      toast.success("Message envoyé");
      setOpen(false);
      setForm({ recipient_id: "", subject: "", body: "" });
      qc.invalidateQueries({ queryKey: ["my-messages"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const reply = async (body: string) => {
    if (!active || !body.trim()) return;
    const otherId = active.sender_id === user?.id ? active.recipient_id : active.sender_id;
    try {
      await sendMessage({ recipient_id: otherId, body, subject: active.subject ?? undefined, student_id: active.student_id, parent_message_id: active.parent_message_id ?? active.id });
      qc.invalidateQueries({ queryKey: ["my-messages"] });
      toast.success("Réponse envoyée");
    } catch (e: any) { toast.error(e.message); }
  };

  const resetFilters = () => { setSearch(""); setStudentFilter("all"); setDateFrom(""); setDateTo(""); setUnreadOnly(false); };

  return (
    <DashboardLayout role={(role as any) ?? "parent"} userName={user?.email ?? "Utilisateur"}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messagerie</h2>
          <p className="text-muted-foreground">Échanges école ↔ familles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nouveau message</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau message</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Destinataire</Label>
                <Select value={form.recipient_id} onValueChange={(v) => setForm({ ...form, recipient_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un destinataire" /></SelectTrigger>
                  <SelectContent>
                    {contactsQ.data?.filter((c) => c.user_id !== user?.id).map((c) => (
                      <SelectItem key={c.user_id} value={c.user_id}>{c.name} {c.role && <span className="ml-1 text-xs text-muted-foreground">({c.role})</span>}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Sujet</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Message</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={send}><Send className="mr-2 h-4 w-4" /> Envoyer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="glass-card mb-4">
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher sujet, message ou contact..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger><SelectValue placeholder="Élève" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les élèves</SelectItem>
              {studentOptions.map((sid) => <SelectItem key={sid} value={sid}>Élève {sid.slice(0, 8)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Du" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Au" />
          <div className="flex items-center gap-2 md:col-span-5">
            <Button size="sm" variant={unreadOnly ? "default" : "outline"} onClick={() => setUnreadOnly(!unreadOnly)}>
              <Mail className="mr-1 h-3 w-3" /> Non lus uniquement
            </Button>
            {(search || studentFilter !== "all" || dateFrom || dateTo || unreadOnly) && (
              <Button size="sm" variant="ghost" onClick={resetFilters}><X className="mr-1 h-3 w-3" /> Réinitialiser</Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{conversations.length} conversation(s)</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Conversations</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {conversations.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucun message</p>}
            {conversations.map((c) => (
              <button key={c.uid} onClick={() => setActive(c.latest)}
                className={`w-full p-3 text-left hover:bg-muted/50 ${active && (active.sender_id === c.uid || active.recipient_id === c.uid) ? "bg-muted" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm flex items-center gap-2">
                    {c.unread > 0 ? <Mail className="h-3 w-3 text-primary" /> : <MailOpen className="h-3 w-3 text-muted-foreground" />}
                    {c.contact?.name ?? "Utilisateur"}
                  </p>
                  {c.unread > 0 && <span className="rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{c.latest.subject || c.latest.body}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.latest.created_at), { locale: fr, addSuffix: true })}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">{active ? (active.subject ?? "Conversation") : "Sélectionnez une conversation"}</CardTitle></CardHeader>
          <CardContent>
            {!active ? (
              <p className="text-center text-sm text-muted-foreground py-12">Aucun message sélectionné</p>
            ) : (
              <ConversationView active={active} userId={user?.id ?? ""} all={msgsQ.data ?? []} onReply={reply} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const ConversationView = ({ active, userId, all, onReply }: { active: Message; userId: string; all: Message[]; onReply: (b: string) => Promise<void> }) => {
  const otherId = active.sender_id === userId ? active.recipient_id : active.sender_id;
  const thread = all
    .filter((m) => (m.sender_id === otherId || m.recipient_id === otherId))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const [reply, setReply] = useState("");

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
        {thread.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-lg p-3 text-sm ${m.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.subject && <p className="mb-1 text-[11px] font-semibold opacity-80">{m.subject}</p>}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">{formatDistanceToNow(new Date(m.created_at), { locale: fr, addSuffix: true })}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea rows={2} placeholder="Répondre..." value={reply} onChange={(e) => setReply(e.target.value)} />
        <Button onClick={async () => { await onReply(reply); setReply(""); }} disabled={!reply.trim()}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default MessagesPage;
