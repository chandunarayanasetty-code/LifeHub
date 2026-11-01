import type { Metadata } from "next";
import Link from "next/link";
import {
  FilterXIcon,
  NotebookPenIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";

import {
  DeleteNoteButton,
  EditNoteButton,
  NewNoteButton,
  PinNoteButton,
} from "@/components/notes/note-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/format";
import { listNoteDocuments } from "@/lib/notes/repository";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notes",
};

export const dynamic = "force-dynamic";

interface NotesPageProps {
  searchParams: Promise<{ intent?: string; q?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();
  const query = (params.q ?? "").trim().slice(0, 120);

  const documents = await listNoteDocuments(user.id);
  const pinnedCount = documents.filter((doc) => doc.pinned).length;

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const notes =
    terms.length === 0
      ? documents
      : documents.filter((note) => {
          const haystack = `${note.title} ${note.content} ${note.tags.join(" ")}`.toLowerCase();
          return terms.every((term) => haystack.includes(term));
        });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Notes"
        title="Notes"
        description="A small, searchable note library with tags and pinning. Notes are plain text and private to your account."
        actions={<NewNoteButton autoOpen={params.intent === "create"} />}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form action="/notes" method="get" className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search titles, tags, or content"
              aria-label="Search notes"
              maxLength={120}
              className="h-8 pl-8"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-8">
            Search
          </Button>
          {query ? (
            <Link
              href="/notes"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FilterXIcon className="size-3.5" aria-hidden="true" />
              Clear
            </Link>
          ) : null}
        </form>

        <Badge variant="outline" className="h-6 w-fit gap-1.5 px-2 text-[10px]">
          <PinIcon className="size-3" aria-hidden="true" />
          {pinnedCount} pinned · {documents.length} total
        </Badge>
      </div>

      {notes.length === 0 ? (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <NotebookPenIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[14px] font-medium">
              {query ? "No matching notes" : "No notes yet"}
            </p>
            <p className="max-w-[320px] text-[11.5px] leading-relaxed text-muted-foreground">
              {query
                ? "Try a different word, or clear the search to see every note."
                : "Capture an idea, a meeting, or a weekly review. Pinned notes stay at the top."}
            </p>
            <Link
              href="/notes?intent=create"
              className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-primary hover:underline"
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
              Write your first note
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                "group gap-0 py-0 transition-shadow hover:shadow-sm",
                note.pinned && "ring-primary/20",
              )}
            >
              <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className={cn(
                        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md",
                        note.pinned
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <NotebookPenIcon className="size-3.5" aria-hidden="true" />
                    </span>
                    <h2 className="text-[13px] leading-snug font-semibold">
                      {note.title}
                    </h2>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <PinNoteButton note={note} />
                  </div>
                </div>

                <p className="mt-2 line-clamp-4 flex-1 text-[11px] leading-relaxed whitespace-pre-line text-muted-foreground">
                  {note.excerpt || "This note is empty."}
                </p>

                {note.tags.length > 0 ? (
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
                ) : null}

                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-2">
                  <p className="text-[10px] text-muted-foreground">
                    Updated {formatRelativeTime(note.updatedAt, now)}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <EditNoteButton note={note} />
                    <DeleteNoteButton note={note} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
