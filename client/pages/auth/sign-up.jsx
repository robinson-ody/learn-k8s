import React, { useState } from 'react';
import use_request from '../../hooks/use-request';
import Router from 'next/router';

const sign_up = () => {
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');

  const { do_request, errors } = use_request({
    url: '/api/user/sign-up',
    method: 'post',
    body: { email, password },
    on_success: () => Router.push('/'),
  });

  const onSubmit = async ev => {
    ev.preventDefault();
    await do_request();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>

      <div className='form-group'>
        <label>Email Address</label>
        <input value={email} type='text' className='form-control' onChange={e => set_email(e.target.value)} />
      </div>

      <div className='form-group'>
        <label>Password</label>
        <input value={password} type='password' className='form-control' onChange={e => set_password(e.target.value)} />
      </div>

      {errors}
      <button className='btn btn-primary'>Sign Up</button>
    </form>
  );
};

export default sign_up;
