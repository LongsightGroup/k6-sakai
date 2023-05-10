import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
export { options } from './options.js';

const BASE_URL = `${__ENV.BASE_URL}`;
const userOptions = JSON.parse(open('users.json'));

export default function () {
  // 1: unauthenticated load of portal should set a new cookie
  const portalPage = http.get(`${BASE_URL}/portal/xlogin`);

  check(portalPage, {
    'is status 200': (r) => r.status === 200,
    'cookie named SAKAIID': (r) => r.cookies.SAKAIID[0].name === 'SAKAIID',
  });

  // 2: post our credentials and get redirected to authenticated home page 
  const authenticatedPage = http.post(`${BASE_URL}/portal/xlogin`, { eid: userOptions.instEid, pw: userOptions.instPw });

  check(authenticatedPage, {
    'auth page is status 200': (r) => r.status === 200,
    'verify homepage text': (r) => r.body.includes('Message Of The Day'),
  });

  // 3: go to the assignments page
  const assignmentsPage = http.get(`${BASE_URL}/portal/site/${userOptions.site}/tool/${userOptions.assignments}`);

  check(assignmentsPage, {
    'assignments page is status 200': (r) => r.status === 200,
    'verify assignments text': (r) => r.body.includes('Assignment Title'),
  });

};

export function handleSummary(data) {
  return {
    "three.html": htmlReport(data),
  };
}