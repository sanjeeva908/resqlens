import type { NotificationDraft } from "@/server/schemas/incident";

export interface NotificationResult {
  success: boolean;
  status: "simulated" | "ready" | "failed";
  recipientLabel: string;
  isSimulated: boolean;
  message: string;
  timestamp: string;
}

export interface CommunicationProvider {
  name: string;
  simulateNotification(draft: NotificationDraft): Promise<NotificationResult>;
}

export class DemoCommunicationProvider implements CommunicationProvider {
  name = "demo";

  async simulateNotification(draft: NotificationDraft): Promise<NotificationResult> {
    return {
      success: true,
      status: "simulated",
      recipientLabel: "Demo Simulation Channel",
      isSimulated: true,
      message: `Demo notification prepared for ${draft.incidentType} at ${draft.location}. No real emergency services contacted.`,
      timestamp: new Date().toISOString(),
    };
  }
}

export class TwilioProvider implements CommunicationProvider {
  name = "twilio";
  private accountSid?: string;
  private authToken?: string;

  constructor(accountSid?: string, authToken?: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
  }

  async simulateNotification(draft: NotificationDraft): Promise<NotificationResult> {
    // Non-negotiable safety requirement:
    // Even if Twilio credentials exist, emergency notifications are strictly SIMULATED
    // unless an explicit non-emergency sandbox demo channel is targeted.
    return {
      success: true,
      status: "simulated",
      recipientLabel: "Twilio Sandbox (Simulated)",
      isSimulated: true,
      message: `Simulated notification recorded via Twilio adapter for ${draft.incidentType}. Dispatch is never performed.`,
      timestamp: new Date().toISOString(),
    };
  }
}

export function getCommunicationProvider(): CommunicationProvider {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return new TwilioProvider(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return new DemoCommunicationProvider();
}
