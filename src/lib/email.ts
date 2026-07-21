import type { IEditor, ILead, IEmailTemplate } from './types';

/**
 * Replace {{variable}} placeholders in a template string with actual values.
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Build the variable map from editor and lead data.
 */
export function getTemplateVariables(
  editor?: Partial<IEditor> | null,
  lead?: Partial<ILead> | null,
  extras?: Record<string, string>
): Record<string, string> {
  const now = new Date();
  return {
    editor_name: editor?.name || '',
    editor_email: editor?.email || '',
    meet_link: editor?.meetLink || '',
    discord_link: process.env.NEXT_PUBLIC_DISCORD_INVITE || process.env.DISCORD_INVITE || '',
    lead_name: lead?.name || '',
    company: lead?.company || '',
    date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    ...extras,
  };
}

/**
 * Open a mailto: link with the rendered template content.
 */
export function buildMailtoUrl(
  to: string,
  template: IEmailTemplate,
  variables: Record<string, string>
): string {
  const subject = encodeURIComponent(renderTemplate(template.subject, variables));
  const body = encodeURIComponent(renderTemplate(template.body, variables));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
