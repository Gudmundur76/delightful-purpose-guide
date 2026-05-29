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
import { template as leadAutoReply } from './lead-auto-reply'
import { template as leadHotNotification } from './lead-hot-notification'
import { template as reportFollowup } from './report-followup'
import { template as scanLeadNotification } from './scan-lead-notification'
import { template as monitorAlert } from './monitor-alert'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'lead-confirmation': leadConfirmation,
  'lead-notification': leadNotification,
  'lead-auto-reply': leadAutoReply,
  'lead-hot-notification': leadHotNotification,
  'report-followup': reportFollowup,
  'scan-lead-notification': scanLeadNotification,
  'monitor-alert': monitorAlert,
}
