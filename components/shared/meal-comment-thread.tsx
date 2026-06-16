"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Send } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createMealComment,
  type CommentAuthorRole,
  type MealComment,
} from "@/lib/types/meal-comments";
import { cn } from "@/lib/utils";

export function MealCommentThread({
  comments,
  onAddComment,
  quickTemplates = [],
  currentAuthorRole,
  currentAuthorName,
  className,
  dietitianProfileHref,
  dietitianAvatarUrl,
  dietitianDisplayName = "Diyetisyen",
}: {
  comments: MealComment[];
  onAddComment: (text: string) => void | Promise<void>;
  quickTemplates?: readonly string[];
  currentAuthorRole: CommentAuthorRole;
  currentAuthorName: string;
  className?: string;
  dietitianProfileHref?: string;
  dietitianAvatarUrl?: string;
  dietitianDisplayName?: string;
}) {
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<MealComment[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setOptimisticComments((pending) =>
      pending.filter(
        (pendingComment) =>
          !comments.some(
            (comment) =>
              comment.id === pendingComment.id ||
              (comment.text === pendingComment.text &&
                comment.authorRole === pendingComment.authorRole),
          ),
      ),
    );
  }, [comments]);

  const visibleComments = [...comments, ...optimisticComments];

  async function submitComment(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    const optimisticComment = createMealComment(
      trimmed,
      currentAuthorRole,
      currentAuthorName,
    );

    setOptimisticComments((current) => [...current, optimisticComment]);
    setDraft("");
    setMenuOpen(false);
    setIsSubmitting(true);

    try {
      await onAddComment(trimmed);
    } catch {
      setOptimisticComments((current) =>
        current.filter((comment) => comment.id !== optimisticComment.id),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitComment(draft);
  }

  return (
    <div className={cn("border-t border-slate-100 dark:border-slate-800", className)}>
      {visibleComments.length > 0 ? (
        <ul className="space-y-2 px-4 py-3">
          {visibleComments.map((comment) => {
            const isDietitian = comment.authorRole === "DIETITIAN";

            return (
              <li
                key={comment.id}
                className={cn(
                  "rounded-2xl px-3 py-2 text-xs",
                  isDietitian
                    ? "bg-teal-500/10 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-zinc-300",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  {isDietitian && dietitianProfileHref && dietitianAvatarUrl ? (
                    <Link
                      href={dietitianProfileHref}
                      className="relative size-6 shrink-0 overflow-hidden rounded-full ring-1 ring-teal-500/30"
                    >
                      <UserAvatar
                        src={dietitianAvatarUrl}
                        alt={dietitianDisplayName}
                        size={24}
                      />
                    </Link>
                  ) : null}
                  <p className="font-semibold">
                    {isDietitian && dietitianProfileHref ? (
                      <Link
                        href={dietitianProfileHref}
                        className="hover:underline"
                      >
                        {comment.authorName}
                      </Link>
                    ) : (
                      comment.authorName
                    )}
                    <span className="ml-2 font-normal text-slate-400 dark:text-zinc-500">
                      {isDietitian ? "Diyetisyen" : "Danışan"}
                    </span>
                  </p>
                </div>
                <p className="leading-relaxed">{comment.text}</p>
              </li>
            );
          })}
        </ul>
      ) : null}

      <form
        className="flex items-center gap-2 px-4 pb-4 pt-1"
        onSubmit={handleSubmit}
      >
        {quickTemplates.length > 0 ? (
          <div className="relative shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => setMenuOpen((open) => !open)}
            >
              Şablon
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  menuOpen && "rotate-180",
                )}
              />
            </Button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Şablon menüsünü kapat"
                />
                <div className="absolute bottom-full left-0 z-20 mb-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                  {quickTemplates.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => void submitComment(template)}
                      className="block w-full px-3 py-2.5 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-slate-800"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            currentAuthorRole === "DIETITIAN"
              ? "Danışana yorum yaz..."
              : "Diyetisyene yanıt yaz..."
          }
          className="h-10 flex-1 rounded-2xl"
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0 rounded-2xl"
          disabled={isSubmitting || !draft.trim()}
          aria-label="Yorum gönder"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
