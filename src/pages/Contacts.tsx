import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, Globe, Hospital, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Contacts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const hospitals = [
    {
      name: "Hospital CUF Lisboa",
      description: "Red de hospitales privados con servicios de ginecología",
      location: "Lisboa, Porto, Cascais, Sintra",
      phone: "217 780 700",
      website: "www.saudecuf.pt",
      icon: Hospital,
    },
    {
      name: "Hospital da Luz",
      description: "Hospital privado con unidad de salud de la mujer",
      location: "Lisboa, Oeiras, Setúbal, Aveiro",
      phone: "217 104 400",
      website: "www.hospitaldaluz.pt",
      icon: Hospital,
    },
    {
      name: "Hospital Lusíadas",
      description: "Grupo hospitalario con especialistas en ginecología y medicina reproductiva",
      location: "Lisboa, Porto, Albufeira, Braga, Faro",
      phone: "210 025 800",
      website: "www.lusiadas.pt",
      icon: Hospital,
    },
  ];

  const clinics = [
    {
      name: "Multicare - Consultas de Salud Femenina",
      description: "Servicio de consultas especializadas con atención online y presencial",
      location: "Portugal (servicio online disponible)",
      phone: "Días útiles 9h-19h",
      website: "medicinaonline.multicare.pt",
      icon: Heart,
    },
    {
      name: "Malo Clinic Ginemed Lisboa",
      description: "Clínica especializada en salud reproductiva y ginecología",
      location: "Lisboa",
      phone: "Consultar en web",
      website: "www.ginemed.es/centros/lisboa",
      icon: Heart,
    },
  ];

  const supportLines = [
    {
      name: "Línea Médis - Salud de la Mujer",
      description: "Línea de apoyo telefónico con enfermeras especializadas en salud femenina",
      phone: "Consultar número en área de cliente",
      website: "www.medis.pt/saude-da-mulher",
      icon: Phone,
    },
    {
      name: "SNS 24 - Serviço Nacional de Saúde",
      description: "Línea de salud pública portuguesa disponible 24/7 para orientación médica",
      phone: "808 24 24 24",
      website: "www.sns24.gov.pt",
      icon: Phone,
    },
  ];

  const associations = [
    {
      name: "Portal Informativo de Salud Femenina",
      description: "Recursos educativos sobre salud menstrual y bienestar",
      contact: "Contacto vía web",
      website: "amenopausa.pt",
      icon: Users,
    },
    {
      name: "Asociaciones de Salud Femenina",
      description: "Organizaciones dedicadas al estudio de la salud de la mujer",
      contact: "Contacto vía redes sociales",
      website: "Consultar directorios locales",
      icon: Users,
    },
  ];

  const renderContacts = (contacts: any[], category: string) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">{category}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{contact.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {contact.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{contact.location}</span>
                  </div>
                )}
                {(contact.phone || contact.contact) && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {contact.phone || contact.contact}
                    </span>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <a
                      href={`https://${contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {contact.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.backToHome')}
        </Button>

        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gradient">
            {t('contacts.title') || 'Contactos de Salud en Portugal'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('contacts.subtitle') || 'Directorio de servicios de salud femenina'}
          </p>
        </div>

        <div className="space-y-8">
          {renderContacts(hospitals, t('contacts.hospitals'))}
          {renderContacts(clinics, t('contacts.clinics'))}
          {renderContacts(supportLines, t('contacts.supportLines'))}
          {renderContacts(associations, "Asociaciones y Recursos Online")}
        </div>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Esta información es orientativa y se basa en recursos disponibles públicamente. 
              Te recomendamos verificar la disponibilidad de servicios y horarios directamente 
              con cada institución antes de acudir.
            </p>
            <p className="text-sm text-muted-foreground">
              Si tienes una emergencia médica, llama al <strong>112</strong> o acude al servicio 
              de urgencias más cercano.
            </p>
            <p className="text-sm text-muted-foreground">
              Para atención en el Servicio Nacional de Salud (SNS), consulta con tu médico de 
              familia o centro de salud local.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
