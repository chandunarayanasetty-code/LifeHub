import { LockKeyholeIcon } from "lucide-react";

export function PreviewNotice({
  title = "Read-only preview",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
      <LockKeyholeIcon
        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <p>
        <span className="font-medium text-foreground">{title}.</span> {children}
      </p>
    </div>
  );
}
