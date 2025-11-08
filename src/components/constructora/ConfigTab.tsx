import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Constructora } from '@/types';
import { Building2, Mail, Phone, MapPin, FileText, CreditCard, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigTabProps {
  constructora: Constructora;
}

const ConfigTab = ({ constructora }: ConfigTabProps) => {
  const handleSave = () => {
    toast.success('Configuración guardada exitosamente');
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      basico: 'bg-secondary text-secondary-foreground',
      profesional: 'bg-primary/10 text-primary',
      empresarial: 'bg-accent/10 text-accent',
    };
    return <Badge className={colors[plan]}>{plan}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Configuración General</h3>
        <p className="text-muted-foreground">Administra la información de tu constructora</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información de la Empresa */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>Datos generales de tu constructora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Input id="company-name" defaultValue={constructora.name} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Input id="rfc" defaultValue={constructora.rfc} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" defaultValue={constructora.email} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" defaultValue={constructora.phone} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input id="address" defaultValue={constructora.address} />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Plan y Suscripción */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Plan y Suscripción</CardTitle>
            <CardDescription>Información de tu plan actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Actual</span>
                {getPlanBadge(constructora.plan)}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha de expiración:</span>
                <span className="font-medium">
                  {new Date(constructora.planExpiry).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Miembro desde:</span>
                <span className="font-medium">
                  {new Date(constructora.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Beneficios de tu Plan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Obras ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Hasta 50 residentes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Reportes personalizados
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Soporte prioritario
                </li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              Cambiar Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Configuración de APIs</CardTitle>
          <CardDescription>
            Endpoints preparados para integración con tu sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Endpoints Disponibles:</p>
            <ul className="space-y-1 text-sm text-muted-foreground font-mono">
              <li>• GET /api/obras - Listar obras</li>
              <li>• POST /api/obras - Crear obra</li>
              <li>• GET /api/residentes - Listar residentes</li>
              <li>• POST /api/residentes - Crear residente</li>
              <li>• GET /api/reportes - Obtener reportes</li>
              <li>• POST /api/pagos - Procesar pago</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Todos los endpoints están preparados con datos dummy. Conecta tu backend cuando esté listo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigTab;
