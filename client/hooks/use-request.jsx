import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body, on_success }) => {
  const [errors, set_errors] = useState(null);

  const do_request = async (props = {}) => {
    try {
      set_errors(null);
      const response = await axios[method](url, { ...body, ...props });
      if (on_success) on_success(response.data);
      return response.data;
    } catch (err) {
      console.log({ err });
      set_errors(
        <div className='alert alert-danger'>
          <h4>Ooops...</h4>

          <ul className='my-0'>
            {err.response.data.errors.map(e => (
              <li key={e.message}>{e.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { do_request, errors };
};
