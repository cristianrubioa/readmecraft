import type { TemplateName, SectionState } from '../types/github'

export const TEMPLATE_CONFIGS: Record<TemplateName, SectionState> = {
  standard: {
    about: true,
    stats: true,
    skills: true,
    projects: false,
  },
  detailed: {
    about: true,
    stats: true,
    skills: true,
    projects: true,
  },
  minimal: {
    about: true,
    stats: false,
    skills: true,
    projects: false,
  },
}
