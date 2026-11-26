import React from 'react';
import { createRoot } from 'react-dom/client';
import Grainient from './Grainient.jsx';

function Background() {
  return (
    <Grainient
      className="sipology-grainient"
      colors={['#21150f', '#38241a', '#70432d', '#b77a4b', '#e9c39d']}
      type="linear"
      angle={42}
      bands={1.15}
      flow={1.05}
      scale={1.15}
      speed={0.32}
      softness={0.9}
      silk={0.48}
      grainAmount={0.075}
      grainSize={1.2}
      grainAnimated={true}
      interactive={true}
      stir={1.35}
      clickSwirl={true}
      intro={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

createRoot(document.getElementById('grainient-root')).render(<Background />);
