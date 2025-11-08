import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, DollarSign } from "lucide-react";
import { Obra } from "@/types";
import { CreateObraDialog } from './CreateObraDialog';
import { EditObraDialog } from './EditObraDialog';
import { GastosObraDialog } from './GastosObraDialog';
import * as api from "@/lib/api";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de respuesta del backend para evitar uso de `any`
type BackendObraRes = {
  id: string;
  constructora_id: string;
  nombre: string;
  direccion?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  is_active?: boolean;
  presupuesto?: number | string;
};

type BackendResidenteRes = {
  id: string;
  nombre?: string;
  apellidos?: string;
};

type BackendAsignacionRes = {
  id: string;
  obra_id: string;
  residente_id: string;
  is_active?: boolean;
  fecha_fin?: string | null;
};

export function ObrasTab() {
  const { user } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isGastosDialogOpen, setGastosDialogOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.constructoraId) return;
      try {
        const [obrasResp, residentesResp, asignacionesResp] = await Promise.all([
          api.listObras(),
          api.listResidentes({ constructora_id: user.constructoraId }),
          api.listAsignacionesObra(),
        ]);
        const constructoraId = user.constructoraId;
        const residentesById: Record<string, { nombre?: string; apellidos?: string }> = {};
        (residentesResp || []).forEach((rr: BackendResidenteRes) => {
          residentesById[rr.id] = { nombre: rr.nombre, apellidos: rr.apellidos };
        });
        const activeAssignByObra: Record<string, string | undefined> = {};
        (asignacionesResp || []).forEach((asig: BackendAsignacionRes) => {
          if (asig.is_active && !asig.fecha_fin) {
            activeAssignByObra[asig.obra_id] = asig.residente_id;
          }
        });
        const mapped: Obra[] = (obrasResp || [])
          .filter((ob: BackendObraRes) => ob.constructora_id === constructoraId)
          .map((ob: BackendObraRes) => {
            const resId = activeAssignByObra[ob.id];
            const resInfo = resId ? residentesById[resId] : undefined;
            const responsable = resInfo ? [resInfo.nombre, resInfo.apellidos].filter(Boolean).join(' ').trim() : 'Sin asignar';
            return {
              id: ob.id,
              name: ob.nombre,
              address: ob.direccion || '',
              startDate: ob.fecha_inicio || '',
              estimatedEndDate: ob.fecha_fin_estimada || '',
              status: ob.is_active ? 'en_progreso' : 'pausada',
              budget: Number(ob.presupuesto || 0),
              constructoraId: ob.constructora_id,
              responsable,
              description: ob.descripcion || '',
            } as Obra;
          });
        setObras(mapped);
      } catch (e: any) {
        toast.error(e?.message || 'Error cargando obras');
      }
    };
    load();
  }, [user]);

  const handleEdit = (obra: Obra) => {
    setSelectedObra(obra);
    setEditDialogOpen(true);
  };

  const handleDelete = async (obraId: string) => {
    await api.deleteObra(obraId);
    setObras(obras.filter(o => o.id !== obraId));
  };

  const handleOpenGastos = (obraId: string) => {
    setSelectedObraId(obraId);
    setGastosDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Obras</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Obra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {obras.map((obra) => (
          <Card key={obra.id}>
            <CardHeader>
              <CardTitle>{obra.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {obra.description && <p className="text-muted-foreground">{obra.description}</p>}
                {obra.address && (
                  <p><span className="font-medium">Dirección:</span> {obra.address}</p>
                )}
                <p><span className="font-medium">Responsable:</span> {obra.responsable || 'Sin asignar'}</p>
                <p>
                  <span className="font-medium">Inicio:</span>{' '}
                  {obra.startDate ? format(new Date(obra.startDate), 'dd MMM yyyy', { locale: es }) : '—'}
                </p>
                <p>
                  <span className="font-medium">Fin estimado:</span>{' '}
                  {obra.estimatedEndDate ? format(new Date(obra.estimatedEndDate), 'dd MMM yyyy', { locale: es }) : '—'}
                </p>
                <p>
                  <span className="font-medium">Presupuesto:</span>{' '}
                  {Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(obra.budget || 0)}
                </p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="icon" onClick={() => handleOpenGastos(obra.id)}>
                  <DollarSign className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleEdit(obra)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(obra.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateObraDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onObraCreated={(newObra) => setObras([...obras, newObra])}
      />

      {selectedObra && (
        <EditObraDialog
          open={isEditDialogOpen}
          onOpenChange={setEditDialogOpen}
          obra={selectedObra}
          onObraUpdated={(updatedObra) =>
            setObras(obras.map(o => o.id === updatedObra.id ? updatedObra : o))
          }
        />
      )}

      {selectedObraId && (
        <GastosObraDialog
          open={isGastosDialogOpen}
          onOpenChange={setGastosDialogOpen}
          obraId={selectedObraId}
        />
      )}
    </div>
  );
}
