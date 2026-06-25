"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

import { getClientLatestDietListForDietitianAction } from "@/app/actions/diet-list";
import { ImageCarousel } from "@/components/shared/image-carousel";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DietListUpload } from "@/lib/types/client-diet-list";
import { triggerFileDownload } from "@/lib/utils/diet-list-files";

export function ClientDietListDialog({
  clientId,
  open,
  onOpenChange,
}: {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [upload, setUpload] = useState<DietListUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    setUpload(null);
    setError(null);

    startTransition(async () => {
      const result = await getClientLatestDietListForDietitianAction(clientId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setUpload(result.data);
    });
  }, [clientId, open]);

  const imageUrls =
    upload?.files
      .filter((file) => file.type === "image")
      .map((file) => file.dataUrl) ?? [];
  const pdfFiles = upload?.files.filter((file) => file.type === "pdf") ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Güncel Diyet Listesi</DialogTitle>
          <DialogDescription>
            Danışanın en son yüklediği diyet programı
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-zinc-400">
              <Loader2 className="size-8 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-sm">Diyet listesi yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : !upload ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/60">
              <FileText className="size-10 text-slate-400 dark:text-zinc-500" />
              <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                Henüz yüklenmiş bir diyet programı yok
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  {upload.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  {upload.files.length} dosya
                </p>
              </div>

              {imageUrls.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <ImageCarousel
                    images={imageUrls}
                    altPrefix={upload.label}
                    aspectClass="aspect-[4/5]"
                  />
                </div>
              ) : null}

              {imageUrls.length === 0 && pdfFiles.length > 0 ? (
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                  <FileText className="size-12 text-teal-600 dark:text-teal-400" />
                  <p className="text-center text-sm font-medium text-slate-600 dark:text-zinc-300">
                    PDF diyet listesi yüklendi
                  </p>
                </div>
              ) : null}

              {pdfFiles.length > 0 ? (
                <div className="space-y-2">
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
                        onClick={() =>
                          triggerFileDownload(file.dataUrl, file.fileName)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-slate-800"
                      >
                        <Download className="size-4" />
                        İndir
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
