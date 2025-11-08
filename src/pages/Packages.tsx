import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const packages = [
  {
    name: 'Básico',
    price: '499',
    description: 'Ideal para constructoras pequeñas y proyectos individuales.',
    features: [
      '5 Proyectos',
      '10 Residentes',
      'Reportes básicos',
      'Soporte por correo',
    ],
    cta: 'Empezar ahora',
  },
  {
    name: 'Profesional',
    price: '999',
    description: 'Perfecto para equipos en crecimiento y múltiples proyectos.',
    features: [
      'Proyectos ilimitados',
      'Residentes ilimitados',
      'Reportes avanzados',
      'Soporte prioritario',
      'Integración con QuickBooks',
    ],
    cta: 'Empezar ahora',
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 'Custom',
    description: 'Soluciones a medida para grandes empresas.',
    features: [
      'Todo lo del plan Profesional',
      'Roles y permisos avanzados',
      'Auditoría de seguridad',
      'Soporte 24/7',
      'Capacitación personalizada',
    ],
    cta: 'Contactar a ventas',
  },
];

const Packages = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-6 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Construdata
          </Link>
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Planes y Precios</h1>
            <p className="text-lg text-muted-foreground">
              Encuentra el plan perfecto para tu constructora. Sin contratos a largo plazo, cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={`flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    {pkg.price !== 'Custom' && <span className="text-muted-foreground">/mes</span>}
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="w-5 h-5 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                    <Link to="/register">{pkg.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Packages;