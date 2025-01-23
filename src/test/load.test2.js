import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '10s', target: 0 },
    ],
};

export default function () {
    group('Public endpoints', function () {
        let res = http.get('https://test.k6.io/public/crocodiles/1/');
        check(res, { 'status is 200': (r) => r.status === 200 });
        sleep(1);

        res = http.get('https://test.k6.io/public/crocodiles/');
        check(res, { 'status is 200': (r) => r.status === 200 });
        sleep(1);
    });

    group('Private endpoints', function () {
        let loginRes = http.post('https://test.k6.io/auth/token/login/', {
            username: 'test',
            password: 'test',
        });

        check(loginRes, { 'login status is 200': (r) => r.status === 200 });

        let authHeaders = {
            headers: {
                Authorization: `Bearer ${loginRes.json('access')}`,
            },
        };

        let res = http.get('https://test.k6.io/my/crocodiles/', authHeaders);
        check(res, { 'status is 200': (r) => r.status === 200 });
        sleep(1);
    });
}