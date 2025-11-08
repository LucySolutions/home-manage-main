import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";

interface GastosTabProps {
  obraId: string;
  residenteId: string;
}

export function GastosTab({ obraId, residenteId }: GastosTabProps) {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    if (obraId && residenteId) {
      api.listGastosObra({ obra_id: obraId, residente_id: residenteId }).then(setGastos);
    }
  }, [obraId, residenteId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Gastos</CardTitle>
        <Button>Agregar Gasto</Button>
      </CardHeader>
      <CardContent>
        <p>Aquí se mostrará la tabla de gastos ({gastos.length} encontrados).</p>
        {/* Aquí iría la tabla de gastos */}
      </CardContent>
    </Card>
  );
}