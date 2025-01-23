# Step-by-Step Guide to Load Testing with k6

Load testing is a crucial step in ensuring your web application’s performance and stability under stress. k6 is an open-source load testing tool designed to be developer-friendly and efficient. In this guide, we’ll walk through the process of setting up and running load tests using k6, from installation to writing scripts and interpreting results.

## Step 1: Installing k6

Installing on macOS
-------------------

Use Homebrew to install k6:

```
brew install k6
```

Installing on Linux
-------------------

Use the package manager for your distribution. For Debian-based systems (like Ubuntu), use:

```
sudo apt-get install k6
```

Installing on Windows
---------------------

Download the Windows binary from the [k6 releases page](https://github.com/grafana/k6/releases) and add it to your PATH. Alternatively, you can use Chocolatey:

```
choco install k6
```

## Step 2: Writing Your First k6 Script

k6 scripts are written in JavaScript. Let’s start with a simple example.

1.  Open your code editor and create a new file named `load.test.js`.
2.  Write the following code:

```
import http from 'k6/http';
import { sleep } from 'k6';
export default function () {
    http.get('https://test.k6.io');
    sleep(1);
}
```

This script performs an HTTP GET request to `https://test.k6.io` and then pauses for 1 second before repeating the process.

## Step 3: Running Your k6 Script

To run your k6 script, open your terminal and navigate to the directory containing `load.test.js`. Then, execute:

```
k6 run load.test.js
```

You’ll see k6 output, showing details about the test run, including the number of requests, response times, and more.

## Step 4: Understanding Virtual Users (VUs) and Duration

Virtual Users (VUs) simulate real users accessing your application. You can specify the number of VUs and the duration of the test:

```
k6 run --vus 10 --duration 30s load.test.js
```

This command runs the test with 10 VUs for 30 seconds.

## Step 5: Creating Complex Scenarios

Let’s create a more complex scenario where the number of users ramps up, holds steady, and then ramps down.

1.  Open your `load.test.js` file.
2.  Modify it as follows:

```
import http from 'k6/http';
import { check, sleep } from 'k6';
export let options = {
    stages: [        { duration: '30s', target: 20 }, // Ramp-up to 20 VUs
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
```

## Step 6: Adding Custom Metrics and Thresholds

You can create custom metrics to gather specific performance data. Let’s add a custom metric to our script.

1.  Open your `load.test.js` file.
2.  Modify it as follows:

```
import { Trend } from 'k6/metrics';
import http from 'k6/http';
import { check, sleep } from 'k6';
let myTrend = new Trend('my_trend');
export let options = {
    stages: [        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
        'my_trend': ['avg<200'], // Custom threshold for the custom metric
    },
};
export default function () {
    let res = http.get('https://test.k6.io');
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    myTrend.add(res.timings.duration);
    sleep(1);
}
```

This script does the following:

*   Defines a custom metric `my_trend`.
*   Sets thresholds for HTTP request duration and the custom metric.
*   Adds the response time to the custom metric.

## Step 7: Monitoring and Reporting

k6 provides a built-in web dashboard that you can enable to visualize and monitor your tests results in real-time.

The web dashboard is a built-in feature of k6. You can enable it by setting the `K6_WEB_DASHBOARD` environment variable to `true` when running your test script, for example:

```
K6_WEB_DASHBOARD=true k6 run load.test.js
```

To automatically generate a report from the command line once the test finishes running, use the `K6_WEB_DASHBOARD_EXPORT` option. For example:

```
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run load.test.js
```

k6 can send test results to various monitoring and reporting tools like Grafana and InfluxDB. Here’s how you can send results to InfluxDB:

1.  Run InfluxDB on your machine or use a cloud service.
2.  Modify your `load.test.js` to include the output option:

```
k6 run --out influxdb=http://localhost:8086/k6 load.test.js
```

You can then use Grafana to visualize the results by connecting it to your InfluxDB database.

## Step 8: Real-World Example

Let’s create a more realistic load test script that tests multiple endpoints and simulates different user behaviors.

1.  Open your `load.test.js` file.
2.  Modify it as follows:

```
import http from 'k6/http';
import { check, sleep, group } from 'k6';
export let options = {
    stages: [        { duration: '30s', target: 20 },
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
```

This script tests both public and private endpoints, simulating different user behaviors.

## Conclusion

k6 is a powerful tool for load testing your web applications. By following this step-by-step guide, you should now be able to set up and run load tests, create complex scenarios, and integrate k6 into your CI/CD pipeline. With k6, you can ensure your application performs well under load and identify any potential bottlenecks before they affect your users.

## References
- [Grafana k6 Documentation](https://grafana.com/docs/k6/latest/)
