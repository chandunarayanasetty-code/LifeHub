"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ListTodoIcon, NotebookPenIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { SearchItem } from "@/lib/search";

export function GlobalSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function openResult(item: SearchItem) {
    setOpen(false);
    router.push(item.href);
  }

  const tasks = items.filter((item) => item.type === "task");
  const notes = items.filter((item) => item.type === "note");

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search tasks and notes"
        className="h-9 gap-2 border-border/80 bg-card/60 px-2.5 text-muted-foreground shadow-xs hover:bg-card sm:min-w-[210px] sm:justify-start"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted/60 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search LifeHub"
        description="Search tasks and notes in the current preview workspace."
      >
        <CommandInput placeholder="Search tasks and notes…" />
        <CommandList>
          <CommandEmpty>No tasks or notes match that search.</CommandEmpty>

          {tasks.length > 0 ? (
            <CommandGroup heading="Tasks">
              {tasks.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle} ${item.keywords}`}
                  onSelect={() => openResult(item)}
                >
                  <ListTodoIcon className="size-4 text-muted-foreground" />
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:block">
                    {item.subtitle}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {tasks.length > 0 && notes.length > 0 ? <CommandSeparator /> : null}

          {notes.length > 0 ? (
            <CommandGroup heading="Notes">
              {notes.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle} ${item.keywords}`}
                  onSelect={() => openResult(item)}
                >
                  <NotebookPenIcon className="size-4 text-muted-foreground" />
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:block">
                    {item.subtitle}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>

        <div className="flex items-center gap-3 border-t bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
          <span className="ml-auto">esc to close</span>
        </div>
      </CommandDialog>
    </>
  );
}
