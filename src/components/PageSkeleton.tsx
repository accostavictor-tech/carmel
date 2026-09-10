const BLOCO = "rounded-lg bg-surface-container-high";

export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className={`h-8 w-56 ${BLOCO}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`h-24 ${BLOCO}`} />
        <div className={`h-24 ${BLOCO}`} />
        <div className={`h-24 ${BLOCO}`} />
      </div>
      <div className="flex flex-col gap-3">
        <div className={`h-16 ${BLOCO}`} />
        <div className={`h-16 ${BLOCO}`} />
        <div className={`h-16 ${BLOCO}`} />
      </div>
    </div>
  );
}
