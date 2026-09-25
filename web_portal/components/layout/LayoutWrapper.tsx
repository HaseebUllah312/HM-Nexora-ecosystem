'use client';

import { ReactNode } from 'react';
import { PageTransition } from '@/components/PageTransition';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <PageTransition type="slideUp" duration={0.4}>
      {children}
    </PageTransition>
  );
}

export default LayoutWrapper;
