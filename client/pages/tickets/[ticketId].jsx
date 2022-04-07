import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { do_request, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
    on_success: order => Router.push('/orders/orderId', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button className='btn btn-primary' onClick={() => do_request()}>
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
