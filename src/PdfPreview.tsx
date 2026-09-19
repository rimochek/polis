// Render authenticated source PDFs and cancel obsolete work when the selection changes.
import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ArrowLeft, ArrowRight, MagnifyingGlassPlus } from '@phosphor-icons/react';
GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({
  fileId,
  page: initialPage,
}: {
  fileId: string;
  page: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, fileId]);
  useEffect(() => {
    let active = true;
    let render: RenderTask | undefined;
    setLoading(true);
    setError('');
    const task = getDocument({
      url: `/api/documents/${fileId}`,
      useSystemFonts: true,
      httpHeaders: {},
      withCredentials: true,
    });
    void (async () => {
      try {
        const pdf = await task.promise;
        if (!active) return;
        setTotal(pdf.numPages);
        const pdfPage = await pdf.getPage(Math.min(page, pdf.numPages));
        if (!active || !ref.current) return;
        const viewport = pdfPage.getViewport({ scale: 1.6 });
        const canvas = ref.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        render = pdfPage.render({ canvas, viewport });
        await render.promise;
        if (active) setLoading(false);
      } catch (e) {
        if (active) {
          setLoading(false);
          setError('Не удалось показать страницу. Откройте исходный PDF по ссылке выше.');
        }
      }
    })();
    // Late PDF promises must not paint into a canvas for a different selection.
    return () => {
      active = false;
      render?.cancel();
      void task.destroy();
    };
  }, [fileId, page]);
  return (
    <div
      className="pdf-source"
      data-source={`/api/documents/${fileId}`}
      data-ready={!loading && !error}
    >
      <div className="pdf-controls">
        <button
          className="icon-button"
          aria-label="Предыдущая страница PDF"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          <ArrowLeft size={15} />
        </button>
        <span>
          Страница {page}
          {total > 0 && ` из ${total}`}
        </span>
        <button
          className="icon-button"
          aria-label="Следующая страница PDF"
          disabled={!total || page >= total || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          <ArrowRight size={15} />
        </button>
        <button
          className="icon-button pdf-zoom"
          aria-label={zoom ? 'Уменьшить PDF' : 'Увеличить PDF'}
          aria-pressed={zoom}
          onClick={() => setZoom(!zoom)}
        >
          <MagnifyingGlassPlus size={17} />
        </button>
      </div>
      <div className="pdf-canvas-scroll">
        {loading && (
          <div className="pdf-loading" role="status">
            <span className="spinner small" />
            Загрузка страницы…
          </div>
        )}
        {error && (
          <p className="pdf-error" role="alert">
            {error}
          </p>
        )}
        <canvas
          ref={ref}
          className={zoom ? 'zoomed' : ''}
          style={{ visibility: loading || error ? 'hidden' : 'visible' }}
          aria-label={`Источник: страница ${page}`}
        />
      </div>
    </div>
  );
}
