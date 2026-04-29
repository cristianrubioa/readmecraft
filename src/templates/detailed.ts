import type { Template } from '../types/github'

export const detailedTemplate: Template = {
  name: 'detailed',
  title: 'Detailed README',
  description: 'Detailed profile with full info',
  sections: {
    about: true,
    stats: true,
    skills: true,
    projects: true,
  },
}
