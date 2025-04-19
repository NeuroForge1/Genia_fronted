import React from 'react';
import Layout from '@/components/layout/Layout';
import CloneInterface from '@/components/clones/CloneInterface';

const VoiceClonePage: React.FC = () => {
  return (
    <Layout>
      <CloneInterface
        cloneType="voice"
        title="Voice Clone"
        description="Convierte texto a voz y transcribe contenido de audio. Crea contenido de audio de alta calidad y obtén transcripciones precisas para tus necesidades."
        placeholder="Describe qué tipo de contenido de voz necesitas. Por ejemplo: 'Necesito convertir este texto a audio para un podcast' o 'Ayúdame a optimizar este guion para que suene más natural al ser leído en voz alta'."
      />
    </Layout>
  );
};

export default VoiceClonePage;
