import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const AdsClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="ads"
        title="Ads Clone"
        description="Crea y optimiza campañas publicitarias efectivas. Genera anuncios que maximicen conversiones y ROI en diferentes plataformas como Facebook, Instagram, Google Ads y más."
        placeholder="Describe qué tipo de anuncios necesitas. Por ejemplo: 'Necesito anuncios para Facebook para promocionar mi curso de marketing digital' o 'Crea textos publicitarios para Google Ads para mi tienda de ropa deportiva'."
      />
    </Layout>
  );
};

export default AdsClonePage;
