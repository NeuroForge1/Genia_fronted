import '../styles/theme.css';
import { ThemeProvider } from '../context/ThemeContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GENIA - Tu Sistema de Crecimiento con IA</title>
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
