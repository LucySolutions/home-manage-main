import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Building, Users, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Construdata
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="#features" className="text-muted-foreground hover:text-foreground">
              Características
            </Link>
            <Link to="#pricing" className="text-muted-foreground hover:text-foreground">
              Precios
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              Iniciar Sesión
            </Link>
          </nav>
          <Button asChild>
            <Link to="/register">Empezar Gratis</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="py-20 md:py-32">
        <div className="container mx-auto text-center px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">La forma moderna de gestionar tus obras</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Construdata centraliza la comunicación, el seguimiento y los pagos de tus proyectos de construcción, todo en un solo lugar.
          </p>
          <Button size="lg" asChild>
            <Link to="/packages">Empezar ahora</Link>
          </Button>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Todo lo que necesitas para tu constructora</h2>
            <p className="text-lg text-muted-foreground mt-4">
              Desde la gestión de residentes hasta reportes financieros detallados.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-6 h-6 mr-2 text-primary" />
                  Gestión de Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                Organiza y supervisa todos tus proyectos desde un dashboard centralizado.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-primary" />
                  Comunicación con Residentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                Mantén a tus clientes informados con actualizaciones de progreso y un portal dedicado.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="w-6 h-6 mr-2 text-primary" />
                  Reportes y Finanzas
                </CardTitle>
              </CardHeader>
              <CardContent>
                Genera reportes de avance, controla presupuestos y gestiona pagos de forma sencilla.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Precios simples y transparentes</h2>
            <p className="text-lg text-muted-foreground mt-4">
              Elige el plan que mejor se adapte a las necesidades de tu empresa.
            </p>
          </div>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link to="/packages">Ver Planes y Precios</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Construdata. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
