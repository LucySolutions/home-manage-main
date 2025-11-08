import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, HardHat, Settings, Users } from 'lucide-react';
import PaymentsTab from '@/components/constructora/PaymentsTab';
import { ObrasTab } from '@/components/constructora/ObrasTab';
import ResidentesTab from '@/components/constructora/ResidentesTab';
import ConfigTab from '@/components/constructora/ConfigTab';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import type { Constructora, Obra, Residente, Payment } from '@/types';

// Tipos de respuesta del backend para evitar uso de `any`
type BackendPlan = { id: string; name?: string };
type BackendConstructoraRes = {
  id: string;
  nombre_empresa?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  plan_id?: string;
  subscription_end_date?: string;
  monto_minimo?: number | string;
  monto_maximo?: number | string;
  created_at?: string;
};
type BackendObraRes = {
  id: string;
  nombre: string;
  direccion?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  is_active?: boolean;
  presupuesto?: number | string;
  constructora_id: string;
  descripcion?: string;
};
type BackendResidenteRes = {
  id: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  constructora_id: string;
  created_at?: string;
  is_active?: boolean;
};
type BackendPagoRes = {
  id: string;
  constructora_id: string;
  monto?: number | string;
  fecha_pago?: string;
  status?: string;
  metodo_pago?: string;
  concepto?: string;
  referencia_pago?: string;
};

// Tipado mínimo para respuestas de gastos_obra utilizadas en el cálculo
type BackendGastoObraRes = {
  monto_total?: number | string;
};

const ConstructoraDashboard = () => {
  const { user } = useAuth();
  const [constructora, setConstructora] = useState<Constructora | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  // Campos de pago dummy
  const [payMethod, setPayMethod] = useState<Payment['method']>('tarjeta');
  const [payAmount, setPayAmount] = useState<number>(999);
  const [cardName, setCardName] = useState('Empresa Demo S.A. de C.V.');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/26');
  const [cardCvv, setCardCvv] = useState('123');
  const [paypalEmail, setPaypalEmail] = useState('demo@empresa.com');
  const [stripeName, setStripeName] = useState('Empresa Demo');
  const [stripeToken, setStripeToken] = useState('tok_dummy_123');

  useEffect(() => {
    const load = async () => {
      if (!user?.constructoraId) return;
      const [c, o, r, p, plans] = await Promise.all([
        api.getConstructora(user.constructoraId),
        api.listObras({ constructora_id: user.constructoraId }),
        api.listResidentes({ constructora_id: user.constructoraId }),
        api.listPagos({ constructora_id: user.constructoraId }),
        api.listPlans(),
      ]);

      // Map constructora to UI shape
      const planName = (() => {
        try {
          const match = (plans || []).find((pl: BackendPlan) => pl.id === (c as BackendConstructoraRes).plan_id);
          return (match?.name || 'basico').toLowerCase();
        } catch {
          return 'basico';
        }
      })();

      const mappedConstructora: Constructora = {
        id: c.id,
        name: c.nombre_empresa || 'Constructora',
        rfc: c.rfc || '',
        email: c.email || '',
        phone: c.telefono || '',
        address: c.direccion || '',
        plan: planName as Constructora['plan'],
        planExpiry: c.subscription_end_date || new Date().toISOString(),
        montoMinimo: typeof c.monto_minimo === 'string' ? Number(c.monto_minimo) : (c.monto_minimo ?? undefined),
        montoMaximo: typeof c.monto_maximo === 'string' ? Number(c.monto_maximo) : (c.monto_maximo ?? undefined),
        createdAt: c.created_at || new Date().toISOString(),
      };

      const mappedObras: Obra[] = (o || []).map((ob: BackendObraRes) => ({
        id: ob.id,
        name: ob.nombre,
        address: ob.direccion || '',
        startDate: ob.fecha_inicio || '',
        estimatedEndDate: ob.fecha_fin_estimada || '',
        status: ob.is_active ? 'en_progreso' : 'pausada',
        budget: Number(ob.presupuesto || 0),
        constructoraId: ob.constructora_id,
        responsable: '',
        description: ob.descripcion || '',
      }));

      const mappedResidentes: Residente[] = (r || []).map((rr: BackendResidenteRes) => ({
        id: rr.id,
        name: [rr.nombre, rr.apellidos].filter(Boolean).join(' ').trim(),
        email: rr.email || '',
        phone: rr.telefono || '',
        obraId: '',
        constructoraId: rr.constructora_id,
        position: 'Residente',
        createdAt: rr.created_at || new Date().toISOString(),
        status: rr.is_active ? 'activo' : 'inactivo',
      }));

      let mappedPayments: Payment[] = (p || []).map((pp: BackendPagoRes) => ({
        id: pp.id,
        constructoraId: pp.constructora_id,
        amount: Number(pp.monto || 0),
        date: pp.fecha_pago || new Date().toISOString(),
        status: (pp.status || 'pendiente') as Payment['status'],
        method: (pp.metodo_pago || 'tarjeta') as Payment['method'],
        concept: pp.concepto || 'Suscripción',
        reference: pp.referencia_pago || '',
      }));

      // Si no hay pagos, prepopular con datos dummy
      if (!mappedPayments.length) {
        mappedPayments = [
          {
            id: 'pay_demo_1',
            constructoraId: user.constructoraId,
            amount: 999,
            date: new Date().toISOString(),
            status: 'completado',
            method: 'tarjeta',
            concept: 'Suscripción mensual',
            reference: 'REF-DEM-001',
          },
          {
            id: 'pay_demo_2',
            constructoraId: user.constructoraId,
            amount: 999,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            status: 'pendiente',
            method: 'paypal',
            concept: 'Suscripción mensual',
            reference: 'REF-DEM-002',
          },
        ];
      }

      setConstructora(mappedConstructora);
      setObras(mappedObras);
      setResidentes(mappedResidentes);
      setPayments(mappedPayments);

      // Calcular gasto acumulado en obras activas
      const activeObraIds = mappedObras.filter(o => o.status === 'en_progreso').map(o => o.id);
      if (activeObraIds.length > 0) {
        const gastosArrays: BackendGastoObraRes[][] = await Promise.all(
          activeObraIds.map(async (obraId) => {
            const gastos = await api.listGastosObra({ obra_id: obraId });
            return (gastos || []) as BackendGastoObraRes[];
          })
        );
        const sum = gastosArrays
          .flat()
          .reduce((acc: number, gasto: BackendGastoObraRes) => acc + Number(gasto.monto_total ?? 0), 0);
        setTotalSpent(sum);
      } else {
        setTotalSpent(0);
      }
    };
    load();
  }, [user]);

  const activeObras = useMemo(() => obras.filter(o => o.status === 'en_progreso').length, [obras]);
  const activeResidentes = useMemo(() => residentes.filter(r => r.status === 'activo').length, [residentes]);
  const totalBudget = useMemo(() => obras.reduce((sum, obra) => sum + (obra.budget || 0), 0), [obras]);
  const spentPercent = useMemo(() => totalBudget > 0 ? Math.min(100, Math.max(0, (totalSpent / totalBudget) * 100)) : 0, [totalSpent, totalBudget]);
  const progressColor = useMemo(() => {
    const min = constructora?.montoMinimo ?? undefined;
    const max = constructora?.montoMaximo ?? undefined;
    if (max && totalSpent >= 0.9 * max) return 'bg-destructive'; // rojo
    if (min && totalSpent >= min) return 'bg-warning'; // amarillo
    return 'bg-success'; // verde
  }, [constructora?.montoMinimo, constructora?.montoMaximo, totalSpent]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Constructora</h2>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {constructora?.name || 'Constructora'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Activas</CardTitle>
              <Building2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeObras}</div>
              <p className="text-xs text-muted-foreground">de {obras.length} totales</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Residentes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeResidentes}</div>
              <p className="text-xs text-muted-foreground">activos</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              <HardHat className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalBudget / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">en obras activas</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Gasto acumulado</span>
                  <span className="font-medium">
                    {Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalSpent)}
                    {totalBudget > 0 ? ` • ${spentPercent.toFixed(0)}%` : ''}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${spentPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
              <CreditCard className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{constructora?.plan || 'basico'}</div>
              <p className="text-xs text-muted-foreground">
                Vence: {constructora?.planExpiry ? new Date(constructora.planExpiry).toLocaleDateString('es-MX') : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="obras" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="obras">
              <Building2 className="h-4 w-4 mr-2" />
              Obras
            </TabsTrigger>
            <TabsTrigger value="residentes">
              <Users className="h-4 w-4 mr-2" />
              Residentes
            </TabsTrigger>
            <TabsTrigger value="pagos">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="pagos-online">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="obras" className="space-y-4">
            <ObrasTab />
          </TabsContent>

          <TabsContent value="residentes" className="space-y-4">
            <ResidentesTab />
          </TabsContent>

          <TabsContent value="pagos" className="space-y-4">
            <PaymentsTab payments={payments} />
          </TabsContent>

          <TabsContent value="pagos-online" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Realizar Pago</CardTitle>
                <CardDescription>Paga tu plan mensual de forma segura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Método de pago</Label>
                    <RadioGroup value={payMethod} onValueChange={(v) => setPayMethod(v as Payment['method'])} className="grid grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tarjeta" id="metodo-tarjeta" />
                        <Label htmlFor="metodo-tarjeta">Tarjeta</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="metodo-paypal" />
                        <Label htmlFor="metodo-paypal">PayPal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="metodo-stripe" />
                        <Label htmlFor="metodo-stripe">Stripe</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monto">Monto</Label>
                      <Input id="monto" type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Concepto</Label>
                      <Input value="Suscripción mensual" readOnly />
                    </div>
                  </div>

                  {payMethod === 'tarjeta' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                        <Input id="card-name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Número de tarjeta</Label>
                        <Input id="card-number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-expiry">Expiración</Label>
                          <Input id="card-expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input id="card-cvv" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {payMethod === 'paypal' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-2">
                        <Label htmlFor="paypal-email">Correo de PayPal</Label>
                        <Input id="paypal-email" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {payMethod === 'stripe' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe-name">Nombre</Label>
                        <Input id="stripe-name" value={stripeName} onChange={(e) => setStripeName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripe-token">Token</Label>
                        <Input id="stripe-token" value={stripeToken} onChange={(e) => setStripeToken(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        const ref = `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                        const newPayment: Payment = {
                          id: `pay_${Date.now()}`,
                          constructoraId: user?.constructoraId || 'demo',
                          amount: payAmount,
                          date: new Date().toISOString(),
                          status: 'completado',
                          method: payMethod,
                          concept: 'Suscripción mensual',
                          reference: ref,
                        };
                        setPayments((prev) => [newPayment, ...prev]);
                        toast.success('Pago registrado (dummy)');
                      }}
                    >
                      Pagar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            {constructora && <ConfigTab constructora={constructora} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ConstructoraDashboard;
