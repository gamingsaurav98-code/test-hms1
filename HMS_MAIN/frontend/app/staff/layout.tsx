'use client';

import React from 'react';
import StaffStructure from '@/components/StaffStructure';
import { withAuth } from '@/lib/auth';

function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffStructure>{children}</StaffStructure>;
}

export default withAuth(StaffLayout, ['staff']);
