import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp-up to 20 VUs
        { duration: '1m', target: 20 },  // Stay at 20 VUs for 1 minute
        { duration: '10s', target: 0 },  // Ramp-down to 0 VUs
    ],
};

export default function () {
    let res = http.get('https://test.k6.io');
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    sleep(1);
}