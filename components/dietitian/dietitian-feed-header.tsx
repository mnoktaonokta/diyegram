"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { DietitianInviteButton } from "@/components/dietitian/dietitian-invite-button";
import { HeaderUserAvatar } from "@/components/shared/header-user-avatar";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useDietitianFeedFilter } from "@/components/dietitian/feed/dietitian-feed-filter-provider";
import { useProfileRevisionValue, useUserProfile } from "@/components/providers/user-profile-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { ClientProfile } from "@/lib/mock/dietitian-data";
import { searchClients } from "@/lib/mock/dietitian-data";
import { applyPublicProfileToClient } from "@/lib/utils/resolve-client-profile";
import { cn } from "@/lib/utils";

export function DietitianFeedHeader({
  clients,
  userName,
  userEmail,
  avatarUrl,
}: {
  clients: ClientProfile[];
  userName: string;
  userEmail?: string | null;
  avatarUrl: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { showCheatOnly, toggleCheatOnly } = useDietitianFeedFilter();
  const profileRevision = useProfileRevisionValue();
  const { displayName, avatarUrl: profileAvatarUrl } = useUserProfile();

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    void profileRevision;

    return searchClients(query)
      .filter((client) => clients.some((entry) => entry.id === client.id))
      .map((client) => applyPublicProfileToClient(client));
  }, [clients, profileRevision, query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-teal-600 dark:text-teal-400">
            Diyegram
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Danışan Akışı
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (searchOpen) {
                closeSearch();
                return;
              }

              setSearchOpen(true);
            }}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              searchOpen
                ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-slate-800",
            )}
            aria-label={searchOpen ? "Aramayı kapat" : "Danışan ara"}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
          <button
            type="button"
            onClick={toggleCheatOnly}
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-base transition-colors",
              showCheatOnly
                ? "bg-rose-500/15 text-rose-600 ring-2 ring-rose-400/60 dark:text-rose-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-slate-800",
            )}
            aria-label={
              showCheatOnly
                ? "Tüm gönderileri göster"
                : "Sadece kaçamakları göster"
            }
            aria-pressed={showCheatOnly}
          >
            🚨
          </button>
          <DietitianInviteButton />
          <NotificationCenter audience="DIETITIAN" />
          <HeaderUserAvatar
            name={displayName || userName}
            avatarUrl={profileAvatarUrl || avatarUrl}
          />
        </div>
      </div>

      {searchOpen ? (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Danışan adı yazın..."
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none ring-teal-500/30 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
      ) : null}

      {query.trim() ? (
        <div className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          {results.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto py-1">
              {results.map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/dietitian/client/${client.id}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/20">
                      <UserAvatar
                        src={client.avatarUrl}
                        alt={client.name}
                        size={40}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
                        {client.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                        {client.measurements.current.weight} kg ·{" "}
                        {client.lastActivity}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-slate-500 dark:text-zinc-400">
              Eşleşen danışan bulunamadı
            </p>
          )}
        </div>
      ) : null}
    </header>
  );
}
