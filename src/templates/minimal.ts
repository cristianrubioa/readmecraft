import type { Template } from '../types/github'

export const minimalTemplate: Template = {
  name: 'minimal',
  title: 'Minimal README',
  description: 'Minimal profile - essentials only',
  sections: {
    about: true,
    stats: false,
    skills: true,
    projects: true,
  },
}
