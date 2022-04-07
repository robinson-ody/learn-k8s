import React, { useState } from 'react';
import formatThousands from 'format-thousands';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
  const [title, set_title] = useState('');
  const [price, setPrice] = useState('');

  const { do_request, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price: price.replace(/\./g, '') },
    on_success: () => Router.push('/'),
  });

  const onBlur = () => {
    const value = price.replace(/\./g, '');
    if (isNaN(+value)) return;
    setPrice(formatThousands(Number(+value).toFixed(0), '.'));
  };

  const onSubmit = e => {
    e.preventDefault();
    do_request();
  };

  return (
    <div>
      <h1>Create a Ticket</h1>

      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label>Title</label>
          <input type='text' className='form-control' value={title} onChange={e => set_title(e.target.value)} />
        </div>

        <div className='form-group'>
          <label>Price</label>

          <input
            type='text'
            className='form-control'
            value={price}
            onChange={e => setPrice(e.target.value)}
            onBlur={onBlur}
          />
        </div>

        {errors}
        <button className='btn btn-primary'>Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
