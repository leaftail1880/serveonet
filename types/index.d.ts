/// <reference types="node" />
/// <reference types="node" />
/**
 * @param {Options} config
 * @returns {Export}
 */
export default function _default(config: Options): Export;
export type Options = {
    localHost?: string;
    localPort: number;
    remotePort: number;
    remoteSubdomain?: string;
    serverAliveCountMax?: number;
    serverAliveInterval?: number;
    sshPort?: number;
    privateKey?: string;
    failedForListenPortNotify?: boolean;
};
export type Events = {
    connect: ReturnType<Serveo["SSHInfo"]>;
    timeout: ReturnType<Serveo["SSHInfo"]>;
    data: string;
    error: {
        message: string;
        killable: true;
        kill: boolean;
    } | {
        message: string;
        killable: false;
    };
    close: {
        restart: boolean;
        code: number;
        onrestart: () => void;
    };
};
export type Export = {
    on<E extends keyof Events>(evt: E, cb: (arg: Events[E]) => any): Export;
    off<E_1 extends keyof Events>(evt: E_1, cb: (arg: Events[E_1]) => any): Export;
    kill(): Export;
    info(): ReturnType<Serveo["SSHInfo"]>;
    pid(): number;
    unkill(): Export;
};
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
declare class Serveo extends EventEmitter {
    /**
     * @param {Options} conf
     */
    constructor(conf: Options);
    /**
     * @template {keyof Events} E
     * @param {E} event
     * @param {(arg: Events[E]) => any} cb
     */
    on<E extends keyof Events>(event: E, cb: (arg: Events[E]) => any): this;
    /**
     * @template {keyof Events} E
     * @param {E} event
     * @param {Events[E]} arg
     */
    emit<E_1 extends keyof Events>(event: E_1, arg: Events[E_1]): boolean;
    host: string;
    localPort: number;
    localHost: string;
    remotePort: number;
    remoteSubdomain: string;
    serverAliveInterval: number;
    serverAliveCountMax: number;
    sshPort: number;
    privateKey: string;
    failedForListenPortNotify: boolean;
    connect(): void;
    SSHInfo(): {
        kill: () => this;
        pid: number;
        host: string;
        localPort: number;
        localHost: string;
        remotePort: number;
        remoteSubdomain: string;
        spawnArguments: string[];
    };
    generateSSHOptions(): string[];
    generateSSHArguments(): string[];
    /**
     * @param {(...args: any[]) => void} spawnCallback
     */
    spawnSSH(spawnCallback: (...args: any[]) => void): void;
    spawnArguments: string[];
    ssh: import("child_process").ChildProcessByStdio<null, import("stream").Readable, import("stream").Readable>;
    /**
     *
     * @param {import("stream").Readable} readable
     * @param {(data: string) => void} callback
     */
    listenForData(readable: import("stream").Readable, callback: (data: string) => void): void;
    kill(): this;
    killed: boolean;
}
import { EventEmitter } from "events";
export {};
