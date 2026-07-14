import { AuditEvent } from "../types";
import { makeId, nowIso } from "../utils/id";
import { versionRegistry } from "../versions";

export class AuditTrail {
  private readonly events: AuditEvent[] = [];

  append(event: Omit<AuditEvent, "eventId" | "timestamp" | "pipelineVersion">): AuditEvent {
    const created: AuditEvent = {
      ...event,
      eventId: makeId("audit"),
      timestamp: nowIso(),
      pipelineVersion: versionRegistry.pipelineVersion
    };
    this.events.push(created);
    return created;
  }

  list(): AuditEvent[] {
    return [...this.events];
  }
}

