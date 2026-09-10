"use client";

import { useId, useRef, useState } from "react";

const LADO_MAXIMO = 640;
const QUALIDADE_JPEG = 0.75;

async function redimensionar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, largura, altura);

  return canvas.toDataURL("image/jpeg", QUALIDADE_JPEG);
}

export function ImagemItemInput({
  name,
  valorInicial,
  disabled,
}: {
  name: string;
  valorInicial: string | null;
  disabled?: boolean;
}) {
  const uid = useId();
  const [preview, setPreview] = useState<string | null>(valorInicial);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErro(null);
    setProcessando(true);
    try {
      const dataUrl = await redimensionar(file);
      setPreview(dataUrl);
    } catch {
      setErro("Não foi possível ler essa imagem. Tente outro arquivo.");
    } finally {
      setProcessando(false);
    }
  }

  function remover() {
    setPreview(null);
    setErro(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL local, sem otimização de next/image
        <img
          src={preview}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md border border-tertiary-fixed object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant text-on-surface-variant">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M4 16.5V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M4 15l4.5-4.5a1.5 1.5 0 0 1 2.12 0L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15.5" cy="8.5" r="1.25" fill="currentColor" />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor={uid} className="sr-only">
          Foto do item
        </label>
        <input
          ref={fileRef}
          id={uid}
          type="file"
          accept="image/*"
          disabled={disabled || processando}
          onChange={selecionarArquivo}
          className="max-w-[220px] text-body-md text-on-surface-variant file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-body-md file:font-medium file:text-on-secondary disabled:opacity-60"
        />
        {processando && <p className="text-body-md text-on-surface-variant">Processando imagem...</p>}
        {erro && <p className="text-body-md text-error">{erro}</p>}
        {preview && !disabled && (
          <button
            type="button"
            onClick={remover}
            className="self-start text-body-md text-error transition hover:underline"
          >
            Remover imagem
          </button>
        )}
      </div>

      <input type="hidden" name={name} value={preview ?? ""} readOnly />
    </div>
  );
}
