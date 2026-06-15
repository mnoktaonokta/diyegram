"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, X } from "lucide-react";

import { ImageCarousel } from "@/components/shared/image-carousel";
import {
  getClientDietListRevision,
  loadClientDietListUploads,
  subscribeClientDietList,
} from "@/lib/storage/client-diet-list-storage";
import type { DietListFile, DietListUpload } from "@/lib/types/client-diet-list";
import { triggerFileDownload } from "@/lib/utils/diet-list-files";

export function useClientDietListUploads() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const revision = useSyncExternalStore(
    subscribeClientDietList,
    getClientDietListRevision,
    () => 0,
  );

  return useMemo(() => {
    void revision;
    if (!userId) {
      return [];
    }

    return loadClientDietListUploads(userId);
  }, [revision, userId]);
}

export function DietListViewerModal({
  upload,
  open,
  onClose,
}: {
  upload: DietListUpload | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!upload) {
    return null;
  }

  const imageUrls = upload.files
    .filter((file) => file.type === "image")
    .map((file) => file.dataUrl);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Kapat"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-4 top-[8dvh] z-50 mx-auto flex max-h-[84dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-100">{upload.label}</p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full text-zinc-400 hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {imageUrls.length > 0 ? (
                <ImageCarousel
                  images={imageUrls}
                  altPrefix={upload.label}
                  aspectClass="aspect-[4/5]"
                />
              ) : null}
              <div className="space-y-2 p-4">
                {upload.files
                  .filter((file) => file.type === "pdf")
                  .map((file) => (
                    <PdfFileActions key={file.id} file={file} />
                  ))}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PdfFileActions({ file }: { file: DietListFile }) {
  return (
    <div className="flex gap-2">
      <a
        href={file.dataUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
      >
        <ExternalLink className="size-4" />
        Görüntüle
      </a>
      <button
        type="button"
        onClick={() => triggerFileDownload(file.dataUrl, file.fileName)}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-slate-800"
      >
        <Download className="size-4" />
        İndir
      </button>
    </div>
  );
}
