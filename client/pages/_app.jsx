import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, current_user }) => {
  return (
    <div>
      <Header current_user={current_user} />
      
      <div className='container'>
        <Component current_user={current_user} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async appContext => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/user/current-user');
  let pageProps = {};

  if (appContext.Component.getInitialProps)
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.current_user);

  return { pageProps, ...data };
};

export default AppComponent;
