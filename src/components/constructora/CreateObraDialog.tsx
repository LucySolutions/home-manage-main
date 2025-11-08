import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import * as api from "@/lib/api";
import { Obra } from '@/types';

interface CreateObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onObraCreated: (obra: Obra) => void;
}

export function CreateObraDialog({ open, onOpenChange, onObraCreated }: CreateObraDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [estimatedEndDate, setEstimatedEndDate] = useState('');
  const [budget, setBudget] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.constructoraId) return;

    const payload = {
      constructora_id: user.constructoraId,
      nombre: name,
      direccion: address,
      descripcion: description,
      fecha_inicio: startDate || null,
      fecha_fin_estimada: estimatedEndDate || null,
      presupuesto: budget || 0,
      is_active: true,
    };

    const created = await api.createObra(payload);
    const mapped: Obra = {
      id: created.id,
      name: created.nombre,
      address: created.direccion || '',
      startDate: created.fecha_inicio || '',
      estimatedEndDate: created.fecha_fin_estimada || '',
      status: created.is_active ? 'en_progreso' : 'pausada',
      budget: Number(created.presupuesto || 0),
      constructoraId: created.constructora_id,
      responsable: 'Sin asignar',
      description: created.descripcion || '',
    };
    onObraCreated(mapped);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Obra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="estimatedEndDate">Fin Estimado</Label>
              <Input id="estimatedEndDate" type="date" value={estimatedEndDate} onChange={(e) => setEstimatedEndDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="budget">Presupuesto (MXN)</Label>
              <Input id="budget" type="number" step="0.01" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}