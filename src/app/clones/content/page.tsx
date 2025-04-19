import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const ContentClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="content"
        title="Content Clone"
        description="Genera contenido de alta calidad para blogs, redes sociales, emails y más. Obtén ideas creativas y bien estructuradas adaptadas a diferentes plataformas y audiencias."
        placeholder="Describe qué tipo de contenido necesitas. Por ejemplo: 'Necesito 5 ideas de publicaciones para Instagram sobre mi negocio de pastelería artesanal' o 'Escribe un artículo de blog sobre los beneficios del yoga para principiantes'."
      />
    </Layout>
  );
};

export default ContentClonePage;
