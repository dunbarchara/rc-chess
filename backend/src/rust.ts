import { spawn, type ChildProcessByStdio } from 'node:child_process';
import type { Readable, Writable } from 'node:stream';

type Proc = ChildProcessByStdio<Writable, Readable, null>;

/**
 * Thin proxy to the Rust chess process: one line in on stdin, everything it
 * prints back (up to its next "> " prompt) out. If the process dies, the next
 * call starts a fresh one (a new game).
 */
export class RustEngine {
  private proc?: Proc;
  private output = '';
  private pending?: { resolve: (out: string) => void; reject: (err: Error) => void };
  private current: Promise<string> = Promise.resolve('');
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly command: string,
    private readonly args: string[] = [],
  ) {}

  /** The latest output from the engine (the starting board for a new process). */
  board(): Promise<string> {
    if (!this.proc) this.start();
    return this.current;
  }

  move(line: string): Promise<string> {
    const run = async () => {
      if (!this.proc) this.start();
      await this.current.catch(() => {});
      this.proc!.stdin.write(`${line.replace(/[\r\n]+/g, ' ')}\n`);
      return this.read();
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => {});
    return result;
  }

  close(): void {
    this.proc?.kill();
  }

  private start(): void {
    const proc = spawn(this.command, this.args, { stdio: ['pipe', 'pipe', 'inherit'] });
    this.proc = proc;
    this.output = '';
    proc.stdout.on('data', (chunk) => {
      this.output += chunk;
      this.settle();
    });
    proc.stdin.on('error', () => {});
    const gone = (err: Error) => {
      if (this.proc === proc) this.proc = undefined;
      this.pending?.reject(err);
      this.pending = undefined;
    };
    proc.on('error', gone);
    proc.on('exit', (code) => gone(new Error(`rust process exited (code ${code})`)));
    this.read(); // the starting board, printed before the first prompt
  }

  private read(): Promise<string> {
    this.current = new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
    });
    this.current.catch(() => {}); // callers handle errors; don't crash on an unobserved rejection
    this.settle();
    return this.current;
  }

  private settle(): void {
    if (!this.pending || !this.output.endsWith('> ')) return;
    const { resolve } = this.pending;
    const out = this.output.slice(0, -2);
    this.pending = undefined;
    this.output = '';
    resolve(out);
  }
}
