import { spawn } from "child_process";
import { EventEmitter } from "events";

// TODO Docs
// TODO Stop when it says that to req domain you need register (Maybe)

/**
 * @typedef {{
 *  localHost?: string;
 *  localPort: number;
 *  remotePort: number;
 *  remoteSubdomain?: string;
 *  serverAliveCountMax?: number;
 *  serverAliveInterval?: number;
 *  sshPort?: number;
 *  privateKey?: string;
 *  failedForListenPortNotify?: boolean
 * }} Options
 *
 * @typedef {{
 *   connect: ReturnType<Serveo["SSHInfo"]>;
 *   timeout: ReturnType<Serveo["SSHInfo"]>;
 *   data: string;
 *   error: {message: string, killable: true; kill: boolean; } | {message: string; killable: false};
 *   close: {restart: boolean, code: number, onrestart: () => void}
 * }} Events
 *
 * @typedef {{
 * on<E extends keyof Events>(evt: E, cb: (arg: Events[E]) => any): Export;
 * off<E extends keyof Events>(evt: E, cb: (arg: Events[E]) => any): Export;
 * kill(): Export;
 * info(): ReturnType<Serveo["SSHInfo"]>;
 * pid(): number;
 * unkill(): Export;
 * }} Export
 */

/**
 * @type {{on: Export["on"]; emit<E extends keyof Events>(evt: E, arg: Events[E]): any}}
 */
class Serveo extends EventEmitter {
	/**
	 * @template {keyof Events} E
	 * @param {E} event
	 * @param {(arg: Events[E]) => any} cb
	 */
	on(event, cb) {
		return super.on(event, cb);
	}
	/**
	 * @template {keyof Events} E
	 * @param {E} event
	 * @param {Events[E]} arg
	 */
	emit(event, arg) {
		return super.emit(event, arg);
	}

	/**
	 * @param {Options} conf
	 */
	constructor(conf) {
		super();

		// TODO Maybe support localhost.net
		this.host = "serveo.net";

		this.localPort = conf.localPort || 80;
		this.localHost = conf.localHost || "localhost";

		this.remotePort = conf.remotePort;
		this.remoteSubdomain = conf.remoteSubdomain;

		this.serverAliveInterval = conf.serverAliveInterval || 120;
		this.serverAliveCountMax = conf.serverAliveCountMax || 1;

		this.sshPort = conf.sshPort || 22;
		this.privateKey = conf.privateKey || null;

		this.failedForListenPortNotify = conf.failedForListenPortNotify ?? true;

		// Execute after all event listeners set
		setImmediate(() => this.connect());
		// Kill subprocess on exit
		process.on("exit", () => this.kill());
	}

	connect() {
		this.spawnSSH(() => {
			this.emit("connect", this.SSHInfo());
		});
	}

	SSHInfo() {
		return {
			kill: () => this.kill(),
			pid: this.ssh ? this.ssh.pid : void 0,
			host: this.host,
			localPort: this.localPort,
			localHost: this.localHost,
			remotePort: this.remotePort,
			remoteSubdomain: this.remoteSubdomain,
			spawnArguments: this.spawnArguments,
		};
	}

	generateSSHOptions() {
		const serverAliveInterval = `-o ServerAliveInterval=${this.serverAliveInterval}`;
		const serverAliveCountMax = `-o ServerAliveCountMax=${this.serverAliveCountMax}`;

		const privateKey = this.privateKey ? `-i ${this.privateKey}` : "";
		const sshPort = this.sshPort === 22 ? "" : `-p ${this.sshPort}`;
		const gatewayPorts =
			this.localHost === "localhost" ? "" : "-o GatewayPorts=yes";

		return [
			"-o ExitOnForwardFailure=yes",
			"-o StrictHostKeyChecking=no",
			serverAliveInterval,
			serverAliveCountMax,
			gatewayPorts,
			privateKey,
			sshPort,
		];
	}

	generateSSHArguments() {
		const subdomain = this.remoteSubdomain ? this.remoteSubdomain + ":" : "";
		const bindAddress = `${subdomain}${this.remotePort}:${this.localHost}:${this.localPort}`;
		const options = this.generateSSHOptions();

		return ["-T", "-R", bindAddress, ...options, this.host].filter(Boolean);
	}

	/**
	 * @param {(...args: any[]) => void} spawnCallback
	 */
	spawnSSH(spawnCallback) {
		this.spawnArguments = this.generateSSHArguments();
		this.ssh = spawn("ssh", this.spawnArguments);
		this.ssh.on("spawn", spawnCallback);

		this.listenForData(this.ssh.stdout, (data) => {
			this.emit("data", data);
		});
		this.listenForData(this.ssh.stderr, (err) => {
			if (this.killed) return;

			if (/(failed for listen port)/i.test(err)) {
				const error = { message: err, killable: true, kill: true };
				const result = this.emit("error", error);
				if (!result && this.failedForListenPortNotify) console.log(err);
				if (error.kill) this.kill();
			} else if (/(timeout)|(timed out)/i.test(err)) {
				this.emit("timeout", this.SSHInfo());
			} else this.emit("error", { message: err, killable: false });
		});

		this.ssh.on("close", (code) => {
			if (this.killed) return;

			const result = { restart: code === 255, code, onrestart: () => void 0 };
			this.emit("close", result);
			if (result.restart) this.spawnSSH(() => result.onrestart());
		});
	}

	/**
	 *
	 * @param {import("stream").Readable} readable
	 * @param {(data: string) => void} callback
	 */
	listenForData(readable, callback) {
		let save = "";
		readable.setEncoding("utf-8");
		readable.on("data", (data) => {
			if (!data.includes("\r")) {
				save += data;
				return;
			}
			callback((save + data).replace(/\r?\n(?:\x1b\[0m)?$/m, ""));
		});
	}

	kill() {
		this.killed = true;
		if (typeof this.ssh?.kill === "function") this.ssh.kill();
		return this;
	}
}

/**
 * @param {Options} config
 * @returns {Export}
 */
export default function (config) {
	const serveo = new Serveo(config);

	return {
		on(evt, listener) {
			serveo.on(evt, listener);
			return this;
		},

		off(evt, listener) {
			serveo.off(evt, listener);
			return this;
		},

		kill() {
			serveo.kill();
			return this;
		},

		unkill() {
			serveo.killed = false;
			return this;
		},

		info() {
			return serveo.SSHInfo();
		},

		pid() {
			if (serveo.ssh) return serveo.ssh.pid;
			else return null;
		},
	};
}
