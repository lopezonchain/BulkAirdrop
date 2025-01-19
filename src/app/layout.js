"use client";
import './globals.css';
import Header from '../components/Header';
import { Providers } from './providers';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect } from 'react';
import localFont from "next/font/local";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        {/* Metadatos */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Bulk Airdrop tool" />
        <title>Bulk Airdrop</title>
      </head>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
