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
    'cookie named JSESSIONID': (r) => r.cookies.JSESSIONID[0].name === 'JSESSIONID',
  });

  // 2: post our credentials and get redirected to authenticated home page 
  const authenticatedPage = http.post(`${BASE_URL}/portal/xlogin`, { eid: userOptions.studentEid, pw: userOptions.studentPw });

  check(authenticatedPage, {
    'auth page is status 200': (r) => r.status === 200,
    'verify homepage text': (r) => r.body.includes('Message Of The Day'),
  });

  // 3: go to the gradebook page
  const gradebookPage = http.get(`${BASE_URL}/portal/site/${userOptions.site}/tool/${userOptions.gradebook}`);

  check(gradebookPage, {
    'gradebook page is status 200': (r) => r.status === 200,
    'verify gradebook text': (r) => r.body.includes('Gradebook'),
  });

};

export function handleSummary(data) {
  return {
    "four.html": htmlReport(data),
  };
}