import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExcelReactViewer } from './react-excel-viewer';

const mount = () => {
  const el = document.getElementById('root');
  if (!el) {
    console.error('Root element #root not found');
    return;
  }
  const root = createRoot(el);
  root.render(<ExcelReactViewer />);
};

mount();
