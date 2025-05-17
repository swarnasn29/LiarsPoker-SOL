'use client';

import { ReactNode } from 'react';
import WalletAdapter from './WalletAdapter';

export default function ClientWalletProvider({ children }: { children: ReactNode }) {
    return <WalletAdapter>{children}</WalletAdapter>;
} 