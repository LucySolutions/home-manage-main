import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import type { Residente, Obra } from '@/types';
import { toast } from 'sonner';

// Tipos de filas devueltas por el backend para residentes y obras
type ResidentRow = {
  id: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  constructora_id: string;
  created_at?: string;
  is_active?: boolean;
};

type ObraRow = {
  id: string;
  nombre: string;
  direccion?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  is_active?: boolean;
  presupuesto?: number;
  constructora_id: string;
};

const ResidentesTab = () => {
  const { user } = useAuth();
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editResidenteId, setEditResidenteId] = useState<string | null>(null);
  const [editObraId, setEditObraId] = useState<string | undefined>(undefined);
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formObraId, setFormObraId] = useState<string | undefined>(undefined);
  const [formStatus, setFormStatus] = useState<'activo' | 'inactivo'>('activo');

  useEffect(() => {
    const load = async () => {
      if (!user?.constructoraId) return;
      const [res, obs, asig] = await Promise.all([
        api.listResidentes({ constructora_id: user.constructoraId }),
        api.listObras({ constructora_id: user.constructoraId }),
        api.listAsignacionesObra(),
      ]);
      const mappedRes: Residente[] = ((res ?? []) as ResidentRow[]).map((rr) => ({
        id: rr.id,
        name: [rr.nombre, rr.apellidos].filter(Boolean).join(' ').trim(),
        email: rr.email ?? '',
        phone: rr.telefono ?? '',
        obraId: '',
        constructoraId: rr.constructora_id,
        position: 'Residente',
        createdAt: rr.created_at ?? new Date().toISOString(),
        status: rr.is_active ? 'activo' : 'inactivo',
      }));
      const mappedObs: Obra[] = ((obs ?? []) as ObraRow[]).map((ob) => ({
        id: ob.id,
        name: ob.nombre,
        address: ob.direccion ?? '',
        startDate: ob.fecha_inicio ?? '',
        estimatedEndDate: ob.fecha_fin_estimada ?? '',
        status: ob.is_active ? 'en_progreso' : 'pausada',
        budget: Number(ob.presupuesto ?? 0),
        constructoraId: ob.constructora_id,
        responsable: '',
        description: ob.descripcion ?? '',
      }));
      // Mapear obra activa por residente
      const activeByResidente: Record<string, string> = {};
      (asig || []).forEach((a: { residente_id: string; obra_id: string; is_active?: boolean; fecha_fin?: string | null }) => {
        if (a.is_active && !a.fecha_fin) {
          activeByResidente[a.residente_id] = a.obra_id;
        }
      });

      setResidentes(
        mappedRes.map((r) => ({ ...r, obraId: activeByResidente[r.id] || '' }))
      );
      setObras(mappedObs);
      setAsignaciones(activeByResidente);
    };
    load();
  }, [user]);

  const handleCreate = async () => {
    if (!user?.constructoraId) return;
    const [nombre, ...rest] = formName.trim().split(' ');
    const apellidos = rest.join(' ');
    const payload = {
      constructora_id: user.constructoraId,
      telefono: formPhone,
      nombre,
      apellidos,
      email: formEmail,
      password: formPassword || undefined,
      obra_id: formObraId,
      is_active: formStatus === 'activo',
    };
    try {
      const created = await api.createResidente(payload);
      const newRes: Residente = {
        id: created.id,
        name: [created.nombre, created.apellidos].filter(Boolean).join(' ').trim(),
        email: created.email || formEmail,
        phone: created.telefono || formPhone,
        obraId: formObraId || '',
        constructoraId: created.constructora_id,
        position: formPosition || 'Residente',
        createdAt: created.created_at || new Date().toISOString(),
        status: created.is_active ? 'activo' : 'inactivo',
      };
      setResidentes([newRes, ...residentes]);
      toast.success('Residente creado exitosamente');
      setIsDialogOpen(false);
      setFormName('');
      setFormPosition('');
      setFormEmail('');
      setFormPassword('');
      setFormPhone('');
      setFormObraId(undefined);
      setFormStatus('activo');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || 'Error creando residente');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteResidente(id);
      setResidentes(residentes.filter(r => r.id !== id));
      toast.success('Residente eliminado');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || 'Error eliminando residente');
    }
  };

  const getObraName = (obraId: string) => {
    return obras.find((o) => o.id === obraId)?.name || 'Sin asignar';
  };

  const openEdit = (residenteId: string) => {
    setEditResidenteId(residenteId);
    const currentObraId = asignaciones[residenteId] || '';
    setEditObraId(currentObraId || undefined);
    setIsEditOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!editResidenteId || !editObraId) {
      toast.error('Selecciona una obra para asignar');
      return;
    }
    try {
      // Cerrar asignaciones activas previas
      const prevAsignaciones = await api.listAsignacionesObra({ residente_id: editResidenteId });
      for (const a of (prevAsignaciones || []) as Array<{ id: string; is_active?: boolean; fecha_fin?: string | null }>) {
        if (a.is_active && !a.fecha_fin) {
          await api.updateAsignacionObra(a.id, { is_active: false, fecha_fin: new Date().toISOString() });
        }
      }
      // Crear nueva asignación activa
      await api.createAsignacionObra({ residente_id: editResidenteId, obra_id: editObraId, is_active: true, fecha_inicio: new Date().toISOString() });
      // Actualizar estado local
      setResidentes((prev) => prev.map((r) => (r.id === editResidenteId ? { ...r, obraId: editObraId || '' } : r)));
      setAsignaciones((prev) => ({ ...prev, [editResidenteId]: editObraId || '' }));
      toast.success('Asignación de obra actualizada');
      setIsEditOpen(false);
      setEditResidenteId(null);
      setEditObraId(undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || 'Error asignando obra');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Gestión de Residentes</h3>
          <p className="text-muted-foreground">Administra el personal de tus obras</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Residente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Residente</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo residente
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Puesto *</Label>
                  <Input id="position" value={formPosition} onChange={(e) => setFormPosition(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña (opcional)</Label>
                  <Input id="password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Si se deja vacío, el sistema generará una contraseña segura automáticamente.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="obra">Obra Asignada *</Label>
                  <Select required onValueChange={(v) => setFormObraId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>
                          {obra.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select defaultValue="activo" onValueChange={(v: 'activo' | 'inactivo') => setFormStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Residente</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Editar asignación de obra */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar Obra</DialogTitle>
              <DialogDescription>Selecciona la obra para el residente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-obra">Obra</Label>
                <Select value={editObraId} onValueChange={(v) => setEditObraId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveAssignment}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {residentes.map((residente) => (
          <Card key={residente.id} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{residente.name}</CardTitle>
                  <CardDescription>{residente.position}</CardDescription>
                </div>
                <Badge variant={residente.status === 'activo' ? 'default' : 'secondary'}>
                  {residente.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{residente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{residente.phone}</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Obra Asignada</p>
                <p className="font-medium">{getObraName(residente.obraId)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(residente.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(residente.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResidentesTab;
