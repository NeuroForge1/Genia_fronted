import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const CEOClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="ceo"
        title="CEO Clone"
        description="Obtén análisis estratégicos y recomendaciones para el crecimiento de tu negocio. Recibe insights valiosos y orientación ejecutiva para tomar decisiones informadas."
        placeholder="Describe qué tipo de análisis estratégico necesitas. Por ejemplo: 'Necesito un análisis FODA para mi startup de tecnología' o 'Ayúdame a crear un plan de expansión para mi negocio de restaurantes'."
      />
    </Layout>
  );
};

export default CEOClonePage;
