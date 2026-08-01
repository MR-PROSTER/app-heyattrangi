interface EmptyStateProps {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)]
        bg-[var(--color-surface)] px-5 py-8 text-center"
    >
      <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">{title}</p>
      {description ? (
        <p className="mt-1 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] leading-[var(--leading-base)]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
