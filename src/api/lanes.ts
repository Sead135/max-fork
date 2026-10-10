import { isQuotaError, sleep } from './http';

const GAP_MS = 1000;

type Job = {
  priority: number;
  run: () => Promise<void>;
};

function createLane(options?: { killOnQuota?: boolean }) {
  const queue: Job[] = [];
  let pumping = false;
  let quotaError: Error | null = null;

  async function pump() {
    if (pumping) {
      return;
    }
    pumping = true;

    while (queue.length > 0) {
      queue.sort((a, b) => a.priority - b.priority);
      const job = queue.shift();
      if (!job) {
        break;
      }

      await job.run();

      if (!(options?.killOnQuota && quotaError)) {
        await sleep(GAP_MS);
      }
    }

    pumping = false;
  }

  function enqueue<T>(task: () => Promise<T>, priority = 1): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push({
        priority,
        run: async () => {
          if (options?.killOnQuota && quotaError) {
            reject(quotaError);
            return;
          }
          try {
            resolve(await task());
          } catch (error) {
            if (options?.killOnQuota && isQuotaError(error)) {
              quotaError = error;
            }
            reject(error);
          }
        }
      });
      void pump();
    });
  }

  function reset() {
    quotaError = null;
    queue.length = 0;
  }

  function isBlocked() {
    return !!quotaError;
  }

  return { enqueue, reset, isBlocked };
}

const historyLane = createLane();
const metaLane = createLane({ killOnQuota: true });

export function enqueueHistory<T>(task: () => Promise<T>, priority = 1) {
  return historyLane.enqueue(task, priority);
}

export function enqueueMeta<T>(task: () => Promise<T>) {
  return metaLane.enqueue(task, 1);
}

export function resetLanes() {
  historyLane.reset();
  metaLane.reset();
}

export function isMetaQuotaBlocked() {
  return metaLane.isBlocked();
}
