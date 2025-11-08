import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Mail, FileText, Calendar, Settings, Edit, Trash2 } from 'lucide-react';
import { Report } from '@/types';
import { toast } from 'sonner';

interface ReportsTabProps {
  reports: Report[];
  residenteId: string;
  obraId: string;
}

const ReportsTab = ({ reports, residenteId, obraId }: ReportsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState('semanal');
  const [sendTime, setSendTime] = useState('08:00');
  const [weekDay, setWeekDay] = useState('lunes');
  const [monthDay, setMonthDay] = useState('1');
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const [localReports, setLocalReports] = useState<Report[]>(reports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleCreateReport = () => {
    toast.success('Reporte creado exitosamente');
    setIsDialogOpen(false);
  };

  const handleSendReport = (reportId: string) => {
    toast.success('Reporte enviado por correo');
  };

  const handleOpenEdit = (report: Report) => {
    setSelectedReport(report);
    setIsEditOpen(true);
  };

  const handleUpdateReport = () => {
    if (!selectedReport) return;
    setLocalReports(prev => prev.map(r => (r.id === selectedReport.id ? selectedReport : r)));
    toast.success('Reporte modificado exitosamente');
    setIsEditOpen(false);
  };

  const handleSaveEmailConfig = () => {
    toast.success('Configuración de correo guardada');
    setIsConfigOpen(false);
  };

  const getTypeBadge = (type: Report['type']) => {
    const colors: Record<Report['type'], string> = {
      avance: 'bg-success/10 text-success',
      incidente: 'bg-destructive/10 text-destructive',
      material: 'bg-warning/10 text-warning',
      personal: 'bg-primary/10 text-primary',
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Mis Reportes</h3>
          <p className="text-muted-foreground">Gestiona tus reportes de obra</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Config Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuración de Envío Automático</DialogTitle>
                <DialogDescription>
                  Configura el envío automático de reportes por correo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-email">Envío Automático</Label>
                  <Switch
                    id="auto-email"
                    checked={autoEmailEnabled}
                    onCheckedChange={setAutoEmailEnabled}
                  />
                </div>

                {autoEmailEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Correos de Destino</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email-new"
                          type="email"
                          placeholder="agregar@email.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!newEmail) return;
                            setEmails(prev => (prev.includes(newEmail) ? prev : [...prev, newEmail]));
                            setNewEmail('');
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                      {emails.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {emails.map((email) => (
                            <Badge key={email} variant="secondary" className="flex items-center gap-1">
                              {email}
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                onClick={() => setEmails(prev => prev.filter(e => e !== email))}
                                aria-label={`Eliminar ${email}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia de Envío</Label>
                      <Select value={emailFrequency} onValueChange={setEmailFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diario</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="quincenal">Quincenal</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="send-time">Hora de envío</Label>
                        <Input
                          id="send-time"
                          type="time"
                          value={sendTime}
                          onChange={(e) => setSendTime(e.target.value)}
                        />
                      </div>
                      {emailFrequency === 'semanal' && (
                        <div className="space-y-2">
                          <Label htmlFor="weekday">Día de la semana</Label>
                          <Select value={weekDay} onValueChange={setWeekDay}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lunes">Lunes</SelectItem>
                              <SelectItem value="martes">Martes</SelectItem>
                              <SelectItem value="miercoles">Miércoles</SelectItem>
                              <SelectItem value="jueves">Jueves</SelectItem>
                              <SelectItem value="viernes">Viernes</SelectItem>
                              <SelectItem value="sabado">Sábado</SelectItem>
                              <SelectItem value="domingo">Domingo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {(emailFrequency === 'quincenal' || emailFrequency === 'mensual') && (
                        <div className="space-y-2">
                          <Label htmlFor="monthday">Día del mes</Label>
                          <Input
                            id="monthday"
                            type="number"
                            min={1}
                            max={31}
                            value={monthDay}
                            onChange={(e) => setMonthDay(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEmailConfig}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Reporte</DialogTitle>
                <DialogDescription>Completa la información del reporte</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateReport();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Reporte *</Label>
                  <Input id="title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Reporte *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avance">Avance</SelectItem>
                      <SelectItem value="incidente">Incidente</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea id="description" rows={5} required />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Reporte</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-soft">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    {getTypeBadge(report.type)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.date).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendReport(report.id)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenEdit(report)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modificar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.description}
              </p>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay reportes creados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea tu primer reporte usando el botón "Nuevo Reporte"
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Report Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modificar Reporte</DialogTitle>
            <DialogDescription>Actualiza la información del reporte</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateReport();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título del Reporte *</Label>
                <Input
                  id="edit-title"
                  required
                  value={selectedReport.title}
                  onChange={(e) => setSelectedReport({ ...selectedReport, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Reporte *</Label>
                <Select
                  value={selectedReport.type}
                  onValueChange={(val) => setSelectedReport({ ...selectedReport, type: val as Report['type'] })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avance">Avance</SelectItem>
                    <SelectItem value="incidente">Incidente</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción *</Label>
                <Textarea
                  id="edit-description"
                  rows={5}
                  required
                  value={selectedReport.description}
                  onChange={(e) => setSelectedReport({ ...selectedReport, description: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsTab;
