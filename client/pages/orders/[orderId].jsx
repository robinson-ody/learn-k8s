import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, current_user }) => {
  const [time_left, set_time_left] = useState(new Date(order.expiresAt) - new Date());

  const { do_request, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    on_success: payment => Router.push('/orders'),
  });

  useEffect(() => {
    const timerInterval = setInterval(() => {
      set_time_left(prevVal => prevVal - 1000);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  if (time_left < 0) return <div>Order expired</div>;

  return (
    <div>
      <h1>Payment</h1>
      <div>{Math.floor(time_left / 1000)} seconds until order expires</div>

      <StripeCheckout
        token={({ id }) => do_request({ token: id })}
        stripeKey='pk_test_t05vYqBywx9QGZTOKUuqPMjs00uwRM0ztf'
        amount={order.ticket.price * 100}
        email={current_user.email}
        currency='IDR'
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
