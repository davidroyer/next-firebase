import UserProvider from '../context/userContext';
import { withTina } from 'tinacms';

// Custom App to wrap it with context provider
function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default withTina(MyApp, {
  enabled: true,
  sidebar: true
});
