export const waitFor = async (
  value: () => any,
  options: {
    maxWaitSeconds: number;
    waitMs: number;
  } = {
    maxWaitSeconds: 3,
    waitMs: 5,
  }
) => {
  const { maxWaitSeconds, waitMs } = options;
  const maxWait = maxWaitSeconds * 1000;
  let counter = 0;

  while (!value() && maxWait > counter) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    counter += waitMs;
  }
};
