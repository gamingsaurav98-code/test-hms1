import React from 'react';
import Structure from '../../components/Structure';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Structure>{children}</Structure>;
}
