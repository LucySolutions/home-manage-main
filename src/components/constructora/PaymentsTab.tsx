import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Payment } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentsTabProps {
  payments: Payment[];
}

const PaymentsTab = ({ payments }: PaymentsTabProps) => {
  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'fallido':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants: Record<Payment['status'], 'default' | 'secondary' | 'destructive'> = {
      completado: 'default',
      pendiente: 'secondary',
      fallido: 'destructive',
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagos</CardTitle>
        <CardDescription>Consulta todos tus pagos realizados</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.date).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="font-medium">{payment.concept}</TableCell>
                <TableCell className="text-muted-foreground">{payment.reference}</TableCell>
                <TableCell className="capitalize">{payment.method}</TableCell>
                <TableCell className="text-right font-semibold">
                  ${payment.amount.toLocaleString('es-MX')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentsTab;
