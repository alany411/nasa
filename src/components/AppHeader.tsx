type AppHeaderProps = {
  kicker: string
}

export function AppHeader({ kicker }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <p className="text-primary text-[13px] font-semibold tracking-[0.14em]">PICTURE OF THE DAY</p>
      <p className="text-muted-foreground text-xs">{kicker}</p>
    </header>
  )
}
