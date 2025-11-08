import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, User, DollarSign } from 'lucide-react';
import ProfileTab from '@/components/residente/ProfileTab';
import ObraInfoTab from '@/components/residente/ObraInfoTab';
import ReportsTab from '@/components/residente/ReportsTab';
import { GastosTab } from '@/components/residente/GastosTab';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Residente, Obra, Report } from '@/types';

const ResidenteDashboard = () => {
  const { user } = useAuth();
  const [residente, setResidente] = useState<Residente | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (user?.residenteId) {
      api.getResidente(user.residenteId).then(setResidente);
      api.getObraByResidente(user.residenteId).then(setObra);
      api.listReports({ residente_id: user.residenteId }).then(setReports);
    }
  }, [user]);

  if (!residente || !obra) {
    return <DashboardLayout><div>Cargando...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Residente</h2>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {residente.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* ... (Card de Obra Asignada) */}
          {/* ... (Card de Reportes Enviados) */}
          {/* ... (Card de Estado) */}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="obra">
              <Building2 className="h-4 w-4 mr-2" />
              Mi Obra
            </TabsTrigger>
            <TabsTrigger value="reportes">
              <FileText className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="gastos">
              <DollarSign className="h-4 w-4 mr-2" />
              Gastos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <ProfileTab residente={residente} />
          </TabsContent>

          <TabsContent value="obra">
            <ObraInfoTab obra={obra} />
          </TabsContent>

          <TabsContent value="reportes">
            <ReportsTab reports={reports} residenteId={residente.id} obraId={obra.id} />
          </TabsContent>

          <TabsContent value="gastos">
            <GastosTab obraId={obra.id} residenteId={residente.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ResidenteDashboard;
