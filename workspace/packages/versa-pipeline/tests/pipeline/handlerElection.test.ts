import {
  RunTaskPayload,
  TaskRunResult,
  TaskRunVoterRecord,
} from "../../src/model";
import { handlerElection } from "../../src/pipeline/handlerElection";
import HandlerElectionFailedError from '../../src/errors/handlerElectionFailed';

describe("handlerElection", () => {
  it("throws an error when no voters are present", () => {
    try {
      handlerElection({}, {} as RunTaskPayload);
    } catch (e) {
      expect(e).toBeInstanceOf(HandlerElectionFailedError)
    }
  });

  it("elects the correct handler", () => {
    const pickMe = jest.fn(async () => []);
    const dontPickMe = jest.fn(async () => []);
    const neitherPickMe = jest.fn(async () => []);

    const voters: TaskRunVoterRecord = {
      neitherPickMe: () => ({
        handler: neitherPickMe,
        weight: 12,
        id: "neitherPickMe",
      }),
      dontPickMe: () => ({
        handler: dontPickMe,
        weight: 9,
        id: "dontPickMe",
      }),
      pickMe: () => ({
        handler: pickMe,
        weight: 2,
        id: "pickMe",
      }),
      pickMeAgain: () => ({
        handler: pickMe,
        weight: 12,
        id: "pickMe",
      }),
    };

    const handler = handlerElection(voters, {} as RunTaskPayload);
    expect(handler).not.toBeNull();
    if (handler) {
      handler({} as RunTaskPayload);
      expect(pickMe).toHaveBeenCalledTimes(1);
      expect(dontPickMe).toHaveBeenCalledTimes(0);
    }
  });
});
