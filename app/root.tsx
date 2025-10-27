import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import NotFoundPage from './components/error/NotFoundPage';
import ErrorPage from './components/error/ErrorPage';
import './app.css';
import CHAKRA_SYSTEM from './configs';
import { Toaster } from './components/ui/toaster';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='light'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='color-scheme' content='light' />
        <Meta />
        <Links />
      </head>
      <body className='light'>
        <ChakraProvider value={CHAKRA_SYSTEM}>
          <Toaster />
          <AuthProvider>{children}</AuthProvider>
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }

    return (
      <ErrorPage
        statusCode={error.status}
        title={`Error ${error.status}`}
        message={error.statusText || 'Terjadi kesalahan pada server.'}
      />
    );
  }

  if (error && error instanceof Error) {
    return (
      <ErrorPage
        statusCode={500}
        title='Terjadi Kesalahan'
        message={error.message || 'Terjadi kesalahan saat memuat halaman ini.'}
        showStackTrace={import.meta.env.DEV}
        stackTrace={error.stack}
      />
    );
  }

  return (
    <ErrorPage
      statusCode={500}
      title='Terjadi Kesalahan Tidak Diketahui'
      message='Terjadi kesalahan yang tidak diketahui. Silahkan coba lagi.'
      showStackTrace={import.meta.env.DEV}
    />
  );
}
