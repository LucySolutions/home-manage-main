import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Obra } from '@/types';
import { Building2, MapPin, Calendar, DollarSign, User } from 'lucide-react';

interface ObraInfoTabProps {
  obra?: Obra;
}

const ObraInfoTab = ({ obra }: ObraInfoTabProps) => {
  if (!obra) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No tienes obra asignada</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planificacion: 'bg-secondary text-secondary-foreground',
      en_progreso: 'bg-success/10 text-success',
      pausada: 'bg-warning/10 text-warning',
      completada: 'bg-primary/10 text-primary',
    };
    return <Badge className={colors[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const calculateProgress = () => {
    const start = new Date(obra.startDate).getTime();
    const end = new Date(obra.estimatedEndDate).getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Información de la Obra</h3>
        <p className="text-muted-foreground">Detalles de tu proyecto asignado</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{obra.name}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {obra.address}
              </CardDescription>
            </div>
            {getStatusBadge(obra.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Descripción</p>
            <p className="text-sm leading-relaxed">{obra.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Responsable</span>
              </div>
              <p className="font-semibold">{obra.responsable}</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Presupuesto</span>
              </div>
              <p className="font-semibold text-lg">
                ${(obra.budget / 1000000).toFixed(2)}M MXN
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso Temporal</span>
              <span className="font-medium">{calculateProgress().toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Fecha de Inicio</span>
              </div>
              <p className="font-medium">
                {new Date(obra.startDate).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Finalización Estimada</span>
              </div>
              <p className="font-medium">
                {new Date(obra.estimatedEndDate).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObraInfoTab;
