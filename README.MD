# Serveo.net

Persistent localhost expose using serveo.net, Node.js and zero dependcies

```bash
yarn add serveonet
```

or

```bash
npm i serveonet
```

## Usage

```js
import serveonet from "serveonet";

serveonet({
	localHost: "localhost",
	localPort: 8888,
	// Note that for request particular subdomain you need to register in first connection.
	remoteSubdomain: "subdom",
	remotePort: 80,
	serverAliveInterval: 60,
	serverAliveCountMax: 3,
})
	.on("connect", (connection) => {
		console.log(
			"Forwarding to localhost:" + connection.localPort,
			"ssh pid: " + connection.pid
		);
	})
	.on("data", (data) => {
		console.log(data);
	})
	.on("timeout", (connection) => {
		console.log("Connection to " + connection.host + " timed out.");
	})
	.on("error", (event) => {
		console.error(event.message);
	})
	.on("close", (event) => {
		console.error("SSH exited with code " + event.code);
		event.onrestart = () => console.info("Restarted");
	});
```

## [https://www.isc.org/licenses/](ISC) License

Copyright © 2023 Leaftail1880
Copyright © 2017 [https://www.npmjs.com/package/autossh](Sam Eaton)
