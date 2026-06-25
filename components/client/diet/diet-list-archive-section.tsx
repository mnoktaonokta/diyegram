"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import Image from "next/image";
import { Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  DietListViewerModal,
  useClientDietListUploads,
} from "@/components/client/diet/diet-list-viewer-modal";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { addClientDietListUpload } from "@/lib/storage/client-diet-list-storage";
import type { DietListUpload } from "@/lib/types/client-diet-list";
import { processDietListFiles, triggerFileDownload } from "@/lib/utils/diet-list-files";
import { uploadClientDietListAction } from "@/app/actions/diet-list";
import { cn } from "@/lib/utils";

function ActiveDietListCard({
  upload,
  onOpen,
}: {
  upload: DietListUpload;
  onOpen: () => void;
}) {
  const imageUrls = upload.files
    .filter((file) => file.type === "image")
    .map((file) => file.dataUrl);
  const pdfFiles = upload.files.filter((file) => file.type === "pdf");
  const hasImages = imageUrls.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {hasImages ? (
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <ImageCarousel
            images={imageUrls}
            altPrefix={upload.label}
            aspectClass="aspect-[4/5]"
          />
        </button>
      ) : (
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-slate-50 px-6 dark:bg-slate-900/60">
          <FileText className="size-12 text-teal-600 dark:text-teal-400" />
          <p className="text-center text-sm font-medium text-slate-600 dark:text-zinc-300">
            PDF diyet listesi yüklendi
          </p>
        </div>
      )}

      <div className="space-y-3 px-4 py-4">
        <div>
          <p className="text-base font-bold text-slate-800 dark:text-zinc-100">
            {upload.label}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {upload.files.length} dosya
          </p>
        </div>

        {hasImages ? (
          <button
            type="button"
            onClick={onOpen}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-zinc-200 dark:hover:bg-slate-800"
          >
            Büyüt / Görüntüle
          </button>
        ) : null}

        {pdfFiles.map((file) => (
          <div key={file.id} className="flex gap-2">
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
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-slate-800"
            >
              <Download className="size-4" />
              İndir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PastDietListGrid({
  uploads,
  onSelect,
}: {
  uploads: DietListUpload[];
  onSelect: (upload: DietListUpload) => void;
}) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-zinc-100">
        Geçmiş Listelerim
      </h3>
      <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        {uploads.map((upload) => {
          const cover =
            upload.files.find((file) => file.type === "image") ??
            upload.files[0];

          return (
            <button
              key={upload.id}
              type="button"
              onClick={() => onSelect(upload)}
              className="group relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900"
            >
              {cover?.type === "image" ? (
                <Image
                  src={cover.dataUrl}
                  alt={upload.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 bg-slate-50 px-2 text-center dark:bg-slate-900/60">
                  <FileText className="size-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                    PDF
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DietListArchiveSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const uploads = useClientDietListUploads();
  const [isUploading, setIsUploading] = useState(false);
  const [viewerUpload, setViewerUpload] = useState<DietListUpload | null>(null);

  const activeUpload = uploads[0] ?? null;
  const pastUploads = uploads.slice(1);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    if (!userId) {
      toast.error("Oturum bulunamadı.");
      return;
    }

    setIsUploading(true);

    try {
      const processed = await processDietListFiles(files);
      addClientDietListUpload(userId, processed);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const syncResult = await uploadClientDietListAction(formData);

      if (!syncResult.success) {
        console.warn("[DietListArchiveSection] DB sync failed:", syncResult.error);
      }

      toast.success("Diyet listesi yüklendi");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Diyet listesi yüklenemedi.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
            Diyet Listesi Arşivi
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Güncel listenizi yükleyin, geçmiş kayıtlarınızı saklayın
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-label="Diyet listesi yükle"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            "border border-slate-200 bg-white text-base text-slate-700 shadow-sm",
            "transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300",
          )}
        >
          {isUploading ? "…" : "➕"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {activeUpload ? (
        <>
          <ActiveDietListCard
            upload={activeUpload}
            onOpen={() => setViewerUpload(activeUpload)}
          />
          <PastDietListGrid uploads={pastUploads} onSelect={setViewerUpload} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-3xl">📋</p>
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
            Henüz aktif bir diyet listeniz bulunmuyor
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
            Sağ üstteki ➕ ile görsel veya PDF yükleyebilirsiniz
          </p>
        </div>
      )}

      <DietListViewerModal
        upload={viewerUpload}
        open={Boolean(viewerUpload)}
        onClose={() => setViewerUpload(null)}
      />
    </section>
  );
}
