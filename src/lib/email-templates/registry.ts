import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

import { template as leadConfirmation } from './lead-confirmation'
import { template as leadNotification } from './lead-notification'
import { template as reportFollowup } from './report-followup'
import { template as scanLeadNotification } from './scan-lead-notification'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'lead-confirmation': leadConfirmation,
  'lead-notification': leadNotification,
  'report-followup': reportFollowup,
  'scan-lead-notification': scanLeadNotification,
}
