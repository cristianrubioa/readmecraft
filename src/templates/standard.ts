import type { Template } from '../types/github'

export const standardTemplate: Template = {
  name: 'standard',
  title: 'Standard README',
  description: 'Complete profile with all sections',
  sections: {
    about: true,
    stats: true,
    skills: true,
    projects: false,
  },
}
