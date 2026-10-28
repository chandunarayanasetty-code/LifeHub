import type { Metadata } from "next";
import { Suspense } from "react";
import { NotebookPenIcon, PinIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PreviewNotice } from "@/components/preview-notice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { getMockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notes",
};

interface NotesPageProps {
  searchParams: Promise<{
    intent?: string;
    highlight?: string;
    q?: string;
  }>;
}

async function NotesPreview({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const now = new Date();
  const data = getMockData(now);
  const notes = [...data.notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  const pinnedCount = notes.filter((note) => note.pinned).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Module preview · Phase 5"
        title="Notes"
        description="A read-only view of a small note library. The editor, tags, pinning, archive, and search persistence arrive with the Notes module."
        actions={
          <Badge
            variant="outline"
            className="h-6 border-amber-500/25 bg-amber-500/5 px-2 text-[10px] text-amber-700 dark:text-amber-400"
          >
            Read-only preview
          </Badge>
        }
      />

      {params.intent === "create" ? (
        <div
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-[12px] leading-relaxed"
        >
          You selected <span className="font-medium">New note</span> from Quick
          add. The note editor and persistence arrive in Phase 5. Nothing was
          saved.
        </div>
      ) : null}

      <PreviewNotice>
        {notes.length} sample notes, {pinnedCount} pinned. Notes are owner-only
        once authentication lands in Phase 4; today this is generated preview
        content with no private data.
      </PreviewNotice>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => {
          const highlighted = params.highlight === note.id;
          return (
            <Card
              key={note.id}
              className={cn(
                "gap-0 py-0 transition-shadow hover:shadow-sm",
                highlighted && "ring-2 ring-primary/30",
              )}
            >
              <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      <NotebookPenIcon className="size-3.5" aria-hidden="true" />
                    </span>
                    <h2 className="text-[13px] leading-snug font-semibold">
                      {note.title}
                    </h2>
                  </div>
                  {note.pinned ? (
                    <PinIcon
                      className="size-3.5 shrink-0 fill-primary/10 text-primary"
                      aria-label="Pinned note"
                    />
                  ) : null}
                </div>

                <p className="mt-2 line-clamp-3 flex-1 text-[11px] leading-relaxed text-muted-foreground">
                  {note.excerpt}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="mt-3 border-t pt-2 text-[10px] text-muted-foreground">
                  Updated {formatRelativeTime(note.updatedAt, now)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function NotesPage(props: NotesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      }
    >
      <NotesPreview {...props} />
    </Suspense>
  );
}
