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

  // 3: Direct Link to the Tests/Quizzes page
  const directlinkPage = http.get(`${BASE_URL}/samigo-app/servlet/Login?id=${userOptions.samigo}`)

  check(directlinkPage, {
    'samigo link page is status 200': (r) => r.status === 200,
  });

  // 4: the above page just does a JS redirect
  const samigoPage = http.get(`${BASE_URL}/samigo-app/jsf/delivery/beginTakingAssessment.faces`)

  check(samigoPage, {
    'verify samigo text': (r) => r.body.includes('for this assessment'),
  });

  // 5: submit the form to take the assessment
  const assessmentPage = samigoPage.submitForm({
    formSelector: 'form#takeAssessmentForm',
  });

  check(assessmentPage, {
    'verify assessment text': (r) => r.body.includes('Table of Contents'),
  });


};

export function handleSummary(data) {
  return {
    "five.html": htmlReport(data),
  };
}
