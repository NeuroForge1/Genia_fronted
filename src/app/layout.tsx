import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/theme/useTheme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Genia - Plataforma de Clones de IA',
  description: 'Crea y gestiona tus clones de IA para diferentes propósitos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} h-full transition-colors duration-200`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
