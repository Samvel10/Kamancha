'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  Users, Shield, DollarSign, MessageSquare, UserPlus, Lock, Pause, Play,
  Trash2, Plus, X, Check, AlertCircle, Send, Star,
} from 'lucide-react';
import { useAuth, RANK, type Role } from '@/lib/auth';
import {
  listStaffUsers, createStaffUser, updateStaffUser, deleteStaffUser,
  getUserPermissions, setUserPermissions,
  getUserKpi, addKpiEntry, voidKpiEntry,
  getFeedbackModeration, approveFeedback, deleteFeedback,
} from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

type Tab = 'team' | 'permissions' | 'kpi' | 'feedback';

interface StaffUser {
  id: number; email: string; name: string; phone?: string | null;
  role: Role; status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  staffProfile?: { position?: string; baseSalary?: number; hiredAt?: string } | null;
  createdBy?: { id: number; name: string; role: string } | null;
}

const ROLE_COLORS: Record<Role, string> = {
  USER: 'bg-slate-100 text-slate-700',
  DEVELOPER: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  DIRECTOR: 'bg-amber-100 text-amber-800',
  ADMIN: 'bg-rose-100 text-rose-700',
};

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
};

const RESOURCES = ['menu', 'events', 'gallery', 'reservations', 'reviews'];

export default function StaffDashboardPage() {
  const t = useTranslations('staff');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('team');
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listStaffUsers();
      setUsers(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role === 'USER')) {
      router.push(`/${locale}/account`);
    } else if (user) {
      reload();
    }
  }, [authLoading, user, router, locale, reload]);

  if (authLoading || !user || user.role === 'USER') {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const canManageAccounts = RANK[user.role] >= RANK.MANAGER;
  const canManagePermissions = canManageAccounts;
  const canManageKpi = canManageAccounts;

  const tabs: { id: Tab; label: string; Icon: typeof Users; show: boolean }[] = [
    { id: 'team',        label: t('tabs.team'),        Icon: Users,         show: true },
    { id: 'permissions', label: t('tabs.permissions'), Icon: Shield,        show: canManagePermissions },
    { id: 'kpi',         label: t('tabs.kpi'),         Icon: DollarSign,    show: canManageKpi },
    { id: 'feedback',    label: t('tabs.feedback'),    Icon: MessageSquare, show: canManageAccounts },
  ];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-10 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#F5ECD7' }}>
          {t('title')}
        </h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">
          {user.name} · <span className="font-semibold text-accent">{user.role}</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
          {tabs.filter((x) => x.show).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                tab === id
                  ? 'bg-primary text-accent border-primary'
                  : 'bg-transparent text-primary border-primary/40 hover:bg-primary hover:text-accent'
              )}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-5 sm:p-8 border border-border"
        >
          {tab === 'team' && (
            <TeamTab users={users} loading={loading} reload={reload} myRole={user.role} canManage={canManageAccounts} />
          )}
          {tab === 'permissions' && (
            <PermissionsTab users={users.filter((u) => u.role === 'DEVELOPER')} />
          )}
          {tab === 'kpi' && (
            <KpiTab users={users.filter((u) => u.role === 'DEVELOPER' || u.role === 'MANAGER')} myRole={user.role} />
          )}
          {tab === 'feedback' && <FeedbackTab />}
        </motion.div>
      </div>
    </div>
  );
}

// ── TEAM TAB ─────────────────────────────────────────────────────────────
function TeamTab({ users, loading, reload, myRole, canManage }: {
  users: StaffUser[]; loading: boolean; reload: () => Promise<void>; myRole: Role; canManage: boolean;
}) {
  const t = useTranslations('staff');
  const [creating, setCreating] = useState(false);

  const createableRoles: Role[] = (['USER', 'DEVELOPER', 'MANAGER'] as Role[])
    .filter((r) => RANK[r] < RANK[myRole]);

  const handleAction = async (id: number, action: 'suspend' | 'activate' | 'delete') => {
    const status = action === 'suspend' ? 'SUSPENDED' : action === 'activate' ? 'ACTIVE' : 'DELETED';
    if (action === 'delete' && !confirm(t('confirmDelete'))) return;
    try {
      await updateStaffUser(id, { status });
      toast.success(t('updated'));
      reload();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t('error'));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
          <Users size={22} className="text-accent" />
          {t('teamTitle')} <span className="text-text-faint text-base font-normal">({users.length})</span>
        </h2>
        {canManage && createableRoles.length > 0 && (
          <button onClick={() => setCreating(true)} className="btn-primary inline-flex items-center gap-2">
            <UserPlus size={16} /> {t('addUser')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-bg-dark rounded-lg animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <Users size={42} className="mx-auto text-accent/40 mb-3" />
          <p>{t('noUsers')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-faint text-xs uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 pr-3">{t('name')}</th>
                <th className="text-left py-2 pr-3">{t('email')}</th>
                <th className="text-left py-2 pr-3">{t('role')}</th>
                <th className="text-left py-2 pr-3">{t('status')}</th>
                <th className="text-right py-2">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 hover:bg-bg/60">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-primary">{u.name}</div>
                    {u.phone && <div className="text-xs text-text-faint">{u.phone}</div>}
                  </td>
                  <td className="py-3 pr-3 text-text-secondary text-xs">{u.email}</td>
                  <td className="py-3 pr-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', ROLE_COLORS[u.role])}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', STATUS_COLORS[u.status])}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {canManage && RANK[u.role] < RANK[myRole] && u.status !== 'DELETED' && (
                      <div className="inline-flex gap-1">
                        {u.status === 'ACTIVE' ? (
                          <button onClick={() => handleAction(u.id, 'suspend')} title={t('suspend')}
                            className="p-1.5 rounded hover:bg-amber-50 text-amber-600">
                            <Pause size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleAction(u.id, 'activate')} title={t('reactivate')}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600">
                            <Play size={14} />
                          </button>
                        )}
                        <button onClick={() => handleAction(u.id, 'delete')} title={t('delete')}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <CreateUserModal
          roles={createableRoles}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); reload(); }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ roles, onClose, onCreated }: {
  roles: Role[]; onClose: () => void; onCreated: () => void;
}) {
  const t = useTranslations('staff');
  const [form, setForm] = useState({ email: '', name: '', phone: '', role: roles[0] || 'USER', baseSalary: 0, position: '' });
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createStaffUser({
        email: form.email, name: form.name, phone: form.phone || undefined,
        role: form.role,
        ...(form.role !== 'USER' ? { baseSalary: form.baseSalary || 0, position: form.position || form.role } : {}),
      });
      setTempPassword(res.tempPassword);
      toast.success(t('userCreated'));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-text-faint hover:text-primary">
          <X size={20} />
        </button>
        <div className="p-6 sm:p-8">
          {tempPassword ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary mb-2">{t('accountCreated')}</h3>
              <p className="text-text-secondary text-sm mb-4">{t('emailSent')}</p>
              <div className="bg-bg-dark rounded-lg p-4 text-left mb-5">
                <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{t('tempPassword')}</p>
                <p className="font-mono text-lg font-bold text-primary">{tempPassword}</p>
              </div>
              <button onClick={onCreated} className="btn-primary w-full">{t('done')}</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <h3 className="font-display text-xl font-bold text-primary mb-3 flex items-center gap-2">
                <UserPlus size={20} className="text-accent" /> {t('newAccount')}
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">{t('role')}</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="input-field">
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">{t('name')}</label>
                <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">{t('email')}</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">{t('phone')}</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="095 711-700" />
              </div>
              {form.role !== 'USER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">{t('position')}</label>
                    <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field" placeholder={form.role} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">{t('baseSalary')} (AMD)</label>
                    <input type="number" min={0} value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: parseInt(e.target.value) || 0 })} className="input-field" />
                  </div>
                </>
              )}
              <button type="submit" disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={16} /> {busy ? '…' : t('createAndEmail')}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── PERMISSIONS TAB ──────────────────────────────────────────────────────
function PermissionsTab({ users }: { users: StaffUser[] }) {
  const t = useTranslations('staff');
  const [selected, setSelected] = useState<number | null>(users[0]?.id || null);
  const [perms, setPerms] = useState<Record<string, { canView: boolean; canEdit: boolean; canDelete: boolean }>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selected) { setPerms({}); return; }
    getUserPermissions(selected).then((res) => {
      const m: Record<string, { canView: boolean; canEdit: boolean; canDelete: boolean }> = {};
      for (const r of RESOURCES) m[r] = { canView: false, canEdit: false, canDelete: false };
      for (const p of res.data) m[p.resource] = { canView: p.canView, canEdit: p.canEdit, canDelete: p.canDelete };
      setPerms(m);
    }).catch(() => {});
  }, [selected]);

  const toggle = (resource: string, flag: 'canView' | 'canEdit' | 'canDelete') => {
    setPerms((p) => ({ ...p, [resource]: { ...p[resource], [flag]: !p[resource]?.[flag] } }));
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await setUserPermissions(selected, RESOURCES.map((r) => ({ resource: r, ...(perms[r] || { canView: false, canEdit: false, canDelete: false }) })));
      toast.success(t('permissionsSaved'));
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t('error'));
    } finally { setBusy(false); }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <Shield size={42} className="mx-auto text-accent/40 mb-3" />
        <p>{t('noDevelopers')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <Shield size={22} className="text-accent" /> {t('permissionsTitle')}
      </h2>
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-dark mb-1">{t('selectDeveloper')}</label>
        <select value={selected || ''} onChange={(e) => setSelected(parseInt(e.target.value))} className="input-field">
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
        </select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg">
            <tr>
              <th className="text-left p-3 text-text-faint uppercase tracking-wider text-xs">{t('page')}</th>
              <th className="p-3 text-text-faint uppercase tracking-wider text-xs">View</th>
              <th className="p-3 text-text-faint uppercase tracking-wider text-xs">Edit</th>
              <th className="p-3 text-text-faint uppercase tracking-wider text-xs">Delete</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r) => (
              <tr key={r} className="border-t border-border">
                <td className="p-3 font-semibold text-primary capitalize">{r}</td>
                {(['canView', 'canEdit', 'canDelete'] as const).map((flag) => (
                  <td key={flag} className="p-3 text-center">
                    <input type="checkbox" checked={!!perms[r]?.[flag]}
                      onChange={() => toggle(r, flag)}
                      className="w-5 h-5 accent-accent cursor-pointer" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={save} disabled={busy} className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-60">
        <Lock size={16} /> {busy ? '…' : t('savePermissions')}
      </button>
    </div>
  );
}

// ── KPI TAB ───────────────────────────────────────────────────────────────
interface KpiEntry { id: number; type: 'FINE' | 'BONUS'; amount: number; reason: string; createdAt: string; voided: boolean; issuedBy: { name: string; role: string }; }
interface KpiSummary { user: { id: number; name: string; role: string }; profile: { position?: string; baseSalary?: number } | null; entries: KpiEntry[]; summary: { baseSalary: number; fines: number; bonuses: number; net: number }; }

function KpiTab({ users, myRole }: { users: StaffUser[]; myRole: Role }) {
  const t = useTranslations('staff');
  const [selected, setSelected] = useState<number | null>(null);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [form, setForm] = useState({ type: 'BONUS' as 'BONUS' | 'FINE', amount: 0, reason: '' });
  const [busy, setBusy] = useState(false);

  const eligible = users.filter((u) => RANK[u.role] < RANK[myRole]);

  useEffect(() => {
    if (eligible[0]) setSelected(eligible[0].id);
  }, [eligible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    if (!selected) return;
    try {
      const res = await getUserKpi(selected);
      setKpi(res.data);
    } catch { setKpi(null); }
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || form.amount <= 0 || form.reason.length < 2) {
      toast.error(t('error'));
      return;
    }
    setBusy(true);
    try {
      await addKpiEntry(selected, form);
      setForm({ type: 'BONUS', amount: 0, reason: '' });
      load();
      toast.success(t('entryAdded'));
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t('error'));
    } finally { setBusy(false); }
  };

  const handleVoid = async (entryId: number) => {
    if (!confirm(t('confirmVoid'))) return;
    try {
      await voidKpiEntry(entryId);
      load();
      toast.success(t('voided'));
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t('error'));
    }
  };

  if (eligible.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <DollarSign size={42} className="mx-auto text-accent/40 mb-3" />
        <p>{t('noStaff')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <DollarSign size={22} className="text-accent" /> {t('kpiTitle')}
      </h2>
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-dark mb-1">{t('selectStaff')}</label>
        <select value={selected || ''} onChange={(e) => setSelected(parseInt(e.target.value))} className="input-field">
          {eligible.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </select>
      </div>

      {kpi && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <SummaryCard label={t('baseSalary')} value={kpi.summary.baseSalary} color="text-primary" />
            <SummaryCard label={t('bonuses')} value={kpi.summary.bonuses} color="text-green-600" />
            <SummaryCard label={t('fines')} value={kpi.summary.fines} color="text-red-600" />
            <SummaryCard label={t('netPay')} value={kpi.summary.net} color="text-accent" highlight />
          </div>

          <form onSubmit={submit} className="border border-border rounded-lg p-4 mb-5 grid sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-text-faint uppercase tracking-wider mb-1">{t('type')}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'BONUS' | 'FINE' })} className="input-field">
                <option value="BONUS">{t('bonus')}</option>
                <option value="FINE">{t('fine')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-faint uppercase tracking-wider mb-1">{t('amount')}</label>
              <input type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-text-faint uppercase tracking-wider mb-1">{t('reason')}</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-field" placeholder={t('reasonPlaceholder')} />
            </div>
            <button type="submit" disabled={busy} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={14} /> {busy ? '…' : t('addEntry')}
            </button>
          </form>

          <h3 className="font-semibold text-primary mb-2">{t('entries')} ({kpi.entries.length})</h3>
          {kpi.entries.length === 0 ? (
            <p className="text-text-faint text-sm py-4">{t('noEntries')}</p>
          ) : (
            <ul className="space-y-2">
              {kpi.entries.map((e) => (
                <li key={e.id} className={cn('border rounded-lg p-3 flex items-center gap-3', e.voided && 'opacity-50 line-through')}>
                  <div className={cn('w-2 h-2 rounded-full', e.type === 'BONUS' ? 'bg-green-500' : 'bg-red-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary">
                      {e.type === 'BONUS' ? '+' : '−'}{formatPrice(e.amount)} — {e.reason}
                    </p>
                    <p className="text-xs text-text-faint">{e.issuedBy.name} ({e.issuedBy.role}) · {new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  {!e.voided && (
                    <button onClick={() => handleVoid(e.id)} className="text-xs text-text-faint hover:text-red-600">
                      {t('void')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, highlight }: { label: string; value: number; color: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg p-3 border', highlight ? 'border-accent bg-accent/5' : 'border-border bg-bg')}>
      <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('font-display font-bold text-xl', color)}>{formatPrice(value)}</p>
    </div>
  );
}

// ── FEEDBACK TAB ──────────────────────────────────────────────────────────
interface FeedbackItem { id: number; rating: number; text: string; approved: boolean; createdAt: string; user?: { id: number; name: string; email: string } | null; }

function FeedbackTab() {
  const t = useTranslations('staff');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getFeedbackModeration()
      .then((res) => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: number) => {
    try {
      await approveFeedback(id);
      load();
      toast.success(t('approved'));
    } catch { toast.error(t('error')); }
  };
  const remove = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await deleteFeedback(id);
      load();
      toast.success(t('deleted'));
    } catch { toast.error(t('error')); }
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-bg-dark rounded-lg animate-pulse" />)}</div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <MessageSquare size={22} className="text-accent" /> {t('feedbackTitle')} <span className="text-text-faint text-base font-normal">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <MessageSquare size={42} className="mx-auto text-accent/40 mb-3" />
          <p>{t('noFeedback')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id} className="border border-border rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < f.rating ? 'text-accent' : 'text-text-faint/30'} fill={i < f.rating ? 'currentColor' : 'none'} />
                    ))}
                    {f.approved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{t('public')}</span>}
                  </div>
                  <p className="text-xs text-text-faint mt-1">
                    {f.user ? `${f.user.name} — ${f.user.email}` : t('anonymous')} · {new Date(f.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!f.approved && (
                    <button onClick={() => approve(f.id)} title={t('approve')} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(f.id)} title={t('delete')} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-text-dark text-sm">{f.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
