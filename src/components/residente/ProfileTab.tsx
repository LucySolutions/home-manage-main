import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Residente } from '@/types';
import { User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileTabProps {
  residente: Residente;
}

const ProfileTab = ({ residente }: ProfileTabProps) => {
  const handleSave = () => {
    toast.success('Perfil actualizado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Mi Perfil</h3>
        <p className="text-muted-foreground">Consulta y actualiza tu información personal</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Tus datos de perfil y contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input id="name" defaultValue={residente.name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" defaultValue={residente.email} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" defaultValue={residente.phone} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Puesto</Label>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Input id="position" defaultValue={residente.position} disabled />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Estado de Cuenta</CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge variant={residente.status === 'activo' ? 'default' : 'secondary'}>
              {residente.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Fecha de Alta</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {new Date(residente.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
