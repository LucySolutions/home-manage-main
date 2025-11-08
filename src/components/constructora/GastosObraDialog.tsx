import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import * as api from "@/lib/api";
import { GastoObra } from '@/types';

interface GastosObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraId: string;
}

const getBadgeVariant = (aprobado: boolean) => {
  return aprobado ? 'default' : 'outline';
};

export function GastosObraDialog({ open, onOpenChange, obraId }: GastosObraDialogProps) {
  const [gastos, setGastos] = useState<GastoObra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && obraId) {
      setLoading(true);
      api.listGastosObra({ obra_id: obraId })
        .then(setGastos)
        .finally(() => setLoading(false));
    }
  }, [open, obraId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gastos de la Obra</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p>Cargando gastos...</p>
          ) : gastos.length === 0 ? (
            <p>No se encontraron gastos para esta obra.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell>{new Date(gasto.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{gasto.categoria}</TableCell>
                    <TableCell>{gasto.descripcion}</TableCell>
                    <TableCell className="text-right">${gasto.monto_total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(gasto.aprobado)}>
                        {gasto.aprobado ? "Aprobado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}