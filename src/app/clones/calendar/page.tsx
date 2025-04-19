import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const CalendarClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="calendar"
        title="Calendar Clone"
        description="Planifica y gestiona tu tiempo de manera eficiente. Crea calendarios editoriales, programa eventos y optimiza tu productividad con recomendaciones personalizadas."
        placeholder="Describe qué tipo de planificación necesitas. Por ejemplo: 'Necesito un calendario editorial para mi blog de cocina' o 'Ayúdame a crear un cronograma para el lanzamiento de mi producto'."
      />
    </Layout>
  );
};

export default CalendarClonePage;
