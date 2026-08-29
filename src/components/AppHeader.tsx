type AppHeaderProps = {
  kicker: string
}

export function AppHeader({ kicker }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <p className="text-[13px] font-semibold tracking-[0.14em] text-primary">PICTURE OF THE DAY</p>
      <p className="text-xs text-muted-foreground">{kicker}</p>
    </header>
  )
}
