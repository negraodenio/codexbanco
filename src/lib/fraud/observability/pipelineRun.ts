import { PipelineRunEvent, PipelineStage } from "../types";
import { makeId, nowIso } from "../utils/id";

export class PipelineRunTracker {
  private readonly events: PipelineRunEvent[] = [];

  start(input: {
    applicationId: string;
    correlationId: string;
    traceId: string;
    stage: PipelineStage;
    processor?: string;
    modelUsed?: string;
  }): PipelineRunEvent {
    const event: PipelineRunEvent = {
      pipelineRunId: makeId("run"),
      applicationId: input.applicationId,
      correlationId: input.correlationId,
      traceId: input.traceId,
      stage: input.stage,
      startTime: nowIso(),
      retryCount: 0,
      processor: input.processor,
      modelUsed: input.modelUsed
    };
    this.events.push(event);
    return event;
  }

  finish(event: PipelineRunEvent, success = true, errorCode?: string): PipelineRunEvent {
    event.endTime = nowIso();
    event.durationMs = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
    event.success = success;
    event.errorCode = errorCode;
    return event;
  }

  list(): PipelineRunEvent[] {
    return [...this.events];
  }
}

