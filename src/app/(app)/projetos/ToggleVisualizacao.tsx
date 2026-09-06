import Link from "next/link";

const BASE = "rounded px-3 py-1.5 text-body-md font-medium transition";
const ATIVO = "bg-primary text-on-primary";
const INATIVO = "text-on-surface-variant hover:bg-tertiary-fixed";

export function ToggleVisualizacao({ modoKanban }: { modoKanban: boolean }) {
  return (
    <div className="flex gap-1 rounded-md border border-tertiary-fixed p-1">
      <Link href="?view=lista" className={`${BASE} ${!modoKanban ? ATIVO : INATIVO}`}>
        Lista
      </Link>
      <Link href="?view=kanban" className={`${BASE} ${modoKanban ? ATIVO : INATIVO}`}>
        Kanban
      </Link>
    </div>
  );
}
