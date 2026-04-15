interface IconProps {
  size?: number
}

const svgProps = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
})

export function Icon({ d, size = 14 }: IconProps & { d: string }) {
  return <svg {...svgProps(size)}><path d={d} /></svg>
}

export function FolderIcon({ open, size = 14 }: IconProps & { open?: boolean }) {
  return (
    <svg {...svgProps(size)}>
      {open
        ? <><path d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1" /><path d="M20.27 13.73A2 2 0 0018.5 13H5.59a2 2 0 00-1.94 2.49l1.2 5A2 2 0 006.79 22h10.42a2 2 0 001.94-1.51l1.2-5a2 2 0 00-.08-1.76z" /></>
        : <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />}
    </svg>
  )
}

export function CodeIcon({ size = 14 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export const ICON_PATHS = {
  plus: 'M12 5v14M5 12h14',
  close: 'M18 6L6 18M6 6l12 12',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  collapse: 'M4 14h6v6M20 10h-6V4M4 14l6-6M20 10l-6 6',
  dock: 'M3 3h18v18H3zM9 3v18',
  edit: 'M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z',
  trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2',
} as const
