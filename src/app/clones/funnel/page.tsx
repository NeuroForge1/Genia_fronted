import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const FunnelClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="funnel"
        title="Funnel Clone"
        description="Crea y optimiza embudos de ventas efectivos. Diseña customer journeys que maximicen conversiones y valor del cliente a lo largo de todo el proceso de venta."
        placeholder="Describe qué tipo de embudo de ventas necesitas. Por ejemplo: 'Necesito un embudo de ventas para mi curso online de fotografía' o 'Ayúdame a optimizar las etapas de mi embudo para aumentar las conversiones'."
      />
    </Layout>
  );
};

export default FunnelClonePage;
