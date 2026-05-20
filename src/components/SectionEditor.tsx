import type { SectionState } from '../types/github'

interface SectionEditorProps {
  sections: SectionState
  onSectionChange: (section: keyof SectionState, enabled: boolean) => void
}

const sectionLabels: Record<keyof SectionState, string> = {
  about: 'About',
  skills: 'Skills',
  stats: 'Stats',
  projects: 'Projects',
}

export function SectionEditor({
  sections,
  onSectionChange,
}: SectionEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(sections) as Array<keyof SectionState>).map((section) => (
        <label
          key={section}
          className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <input
            type="checkbox"
            checked={sections[section]}
            onChange={(e) => onSectionChange(section, e.target.checked)}
            className="w-5 h-5 rounded-md accent-slate-500"
          />
          <span className="text-sm font-light text-slate-700 dark:text-slate-300">
            {sectionLabels[section]}
          </span>
        </label>
      ))}
    </div>
  )
}
