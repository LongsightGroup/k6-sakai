export const options = {
    scenarios: {
      sakaiflood: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 10,
        maxDuration: '30s',
      },
    },
    thresholds: {
      'http_req_duration': ['p(99)<4000'], // 99% of requests must complete below 3.0s
    },
    insecureSkipTLSVerify: true,
  };