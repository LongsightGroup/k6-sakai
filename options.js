export const options = {
    scenarios: {
      sakaiflood: {
        executor: 'shared-iterations',
        vus: 700,
        iterations: 100000,
        maxDuration: '900s',
      },
    },
    thresholds: {
      'http_req_duration': ['p(99)<4000'], // 99% of requests must complete below 4.0s
    },
    insecureSkipTLSVerify: true,
  };
