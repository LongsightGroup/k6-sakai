import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
export { options } from './options.js';

const BASE_URL = `${__ENV.BASE_URL}`;

export default function () {
  const portalPage = http.get(`${BASE_URL}/portal/`);

  check(portalPage, {
    'is status 200': (r) => r.status === 200,
    'has cookie SAKAIID': (r) => r.cookies.SAKAIID.length > 0,
    'cookie has correct name': (r) => r.cookies.SAKAIID[0].name === 'SAKAIID',
  });

  const xloginPage = http.get(`${BASE_URL}/portal/xlogin`);

    check(xloginPage, {
    'is status 200': (r) => r.status === 200,
  });

};

export function handleSummary(data) {
  return {
    "one.html": htmlReport(data),
  };
}