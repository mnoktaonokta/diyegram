"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

import { DietitianInviteButton } from "@/components/dietitian/dietitian-invite-button";
import { DietitianSocialGrid } from "@/components/dietitian/social/dietitian-social-grid";
import { DietitianSocialHeader } from "@/components/dietitian/social/dietitian-social-header";
import { DietitianSocialPostDialog } from "@/components/dietitian/social/dietitian-social-post-dialog";
import { DietitianSocialShareModal } from "@/components/dietitian/social/dietitian-social-share-modal";
import { useDietitianSocialProfile } from "@/components/dietitian/social/use-dietitian-social-profile";
import type { DietitianSocialPost } from "@/lib/types/dietitian-social";
import { filterPostsByHashtag } from "@/lib/utils/dietitian-hashtags";

export function DietitianSocialProfileView({
  canEdit = false,
  backHref,
  backLabel = "Geri",
}: {
  canEdit?: boolean;
  backHref: string;
  backLabel?: string;
}) {
  const profile = useDietitianSocialProfile();
  const { refreshSocialProfile } = profile;
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<DietitianSocialPost | null>(
    null,
  );
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    if (!activeHashtag) {
      return profile.posts;
    }

    return filterPostsByHashtag(profile.posts, activeHashtag);
  }, [activeHashtag, profile.posts]);

  function handleHashtagClick(hashtag: string) {
    setActiveHashtag(hashtag);
    setSelectedPost(null);
  }

  return (
    <>
      <div className="px-4 pt-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </div>

      <DietitianSocialHeader
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        gender={profile.gender}
        title={profile.title}
        bio={profile.bio}
        postCount={profile.posts.length}
        canEdit={canEdit}
        onShareClick={() => setShareOpen(true)}
      />

      {canEdit ? (
        <div className="px-4 pb-4">
          <DietitianInviteButton variant="profile" />
        </div>
      ) : null}

      {activeHashtag ? (
        <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/80 px-4 py-3 dark:border-teal-900 dark:bg-teal-950/40">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-700/80 dark:text-teal-300/80">
              Etiket filtresi
            </p>
            <p className="truncate text-sm font-semibold text-teal-800 dark:text-teal-200">
              #{activeHashtag}
              <span className="ml-2 font-normal text-teal-700/80 dark:text-teal-300/80">
                · {visiblePosts.length} paylaşım
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveHashtag(null)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-zinc-300 dark:hover:bg-slate-800"
          >
            <X className="size-3.5" />
            Temizle
          </button>
        </div>
      ) : null}

      <DietitianSocialGrid
        posts={visiblePosts}
        onSelectPost={setSelectedPost}
        emptyTitle={
          activeHashtag
            ? `#${activeHashtag} etiketiyle paylaşım bulunamadı`
            : "Henüz paylaşım yok"
        }
        emptyHint={
          activeHashtag
            ? "Farklı bir etiket deneyin veya filtreyi temizleyin."
            : undefined
        }
      />

      {canEdit ? (
        <DietitianSocialShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          onShared={refreshSocialProfile}
        />
      ) : null}

      <DietitianSocialPostDialog
        post={selectedPost}
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        readOnly={!canEdit}
        onHashtagClick={handleHashtagClick}
      />
    </>
  );
}
