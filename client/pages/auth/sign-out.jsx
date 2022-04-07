import Router from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';

export default () => {
  const { do_request } = useRequest({
    url: '/api/user/sign-out',
    method: 'post',
    body: {},
    on_success: () => Router.push('/'),
  });

  useEffect(() => {
    do_request();
  }, []);

  return <div>Signing you out...</div>;
};
