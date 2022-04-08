import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      baseURL: 'http://funny-vid.xyz',
      headers: req.headers,
    });
  }

  return axios.create({ baseURL: '/' });
};
