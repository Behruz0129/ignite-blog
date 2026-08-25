"use client";

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { createSlashCommand } from "./editor/slash-command";
import { api } from "@/lib/api";
import type { Media } from "@/lib/types";
import { createLowlight, common } from "lowlight";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

const lowlight = createLowlight(common);

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Media kutubxonadan rasm tanlash (bo'lmasa URL so'raladi) */
  onPickImage?: () => void;
}

// Windows/Linux va Mac uchun tugma nomi
function modKey(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
}


/**
 * Rasmni Cloudinary'ga yuklab, kursor turgan joyga qo'yadi. Skrinshotni
 * to'g'ridan-to'g'ri Ctrl+V bilan tashlash yoki faylni sudrab olib kelish
 * uchun — yozayotganda media kutubxonani ochib o'tirish shart bo'lmasin.
 *
 * Yuklanish holati status panelida ko'rsatiladi (`onBusy`), shuning uchun
 * matnga vaqtinchalik "yuklanmoqda" bloki qo'yilmaydi: u bekor qilinganda
 * yoki xato bo'lganda matnni tozalash chalkash bo'lardi.
 */
async function uploadImage(
  editor: TiptapEditor,
  file: File,
  onBusy: (busy: boolean) => void
) {
  if (!file.type.startsWith("image/")) return;

  onBusy(true);
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.upload<Media>("/media/upload", fd);
    editor.chain().focus().setImage({ src: res.data.url }).run();
  } catch (error) {
    console.error("Rasm yuklanmadi", error);
    window.alert("Rasm yuklanmadi. Qaytadan urinib ko'ring.");
  } finally {
    onBusy(false);
  }
}

// ---------------------------------------------------------------- tugma

interface BtnProps {
  icon?: IconName;
  label?: string;
  title: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function Btn({
  icon,
  label,
  title,
  shortcut,
  onClick,
  active,
  disabled,
}: BtnProps) {
  return (
    <button
      type="button"
      title={shortcut ? `${title} (${shortcut})` : title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`tiptap-btn ${active ? "is-active" : ""}`}
    >
      {icon && <Icon name={icon} className="h-[18px] w-[18px]" />}
      {label && <span className="px-0.5 text-[13px] font-medium">{label}</span>}
    </button>
  );
}

function Divider() {
  return <span className="tiptap-divider" />;
}

// ---------------------------------------------------------------- havola

/**
 * Havola qo'shish oynasi. window.prompt o'rniga — chunki prompt brauzerni
 * bloklaydi, mavjud havolani ko'rsatmaydi va bekor qilish noqulay.
 */
function LinkPopover({
  editor,
  onClose,
}: {
  editor: TiptapEditor;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string>(
    () => (editor.getAttributes("link").href as string) || ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function apply() {
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      // Protokolsiz kiritilsa https:// qo'shamiz
      const href = /^(https?:|mailto:|\/|#)/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href })
        .run();
    }
    onClose();
  }

  return (
    <div className="absolute left-2 top-full z-30 mt-1 w-80 animate-pop-in rounded-xl border border-line bg-paper p-3 shadow-pop">
      <label className="field-label">Havola manzili</label>
      <input
        ref={inputRef}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder="masalan: ignite.uz/yangilik"
        className="input font-mono text-[13px]"
      />
      <div className="mt-2.5 flex items-center gap-2">
        <button type="button" onClick={apply} className="btn-primary btn-sm">
          Saqlash
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onClose();
            }}
            className="btn-ghost btn-sm"
          >
            Olib tashlash
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost btn-sm ml-auto"
        >
          Bekor
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- toolbar

function Toolbar({
  editor,
  onPickImage,
  fullscreen,
  onToggleFullscreen,
  linkOpen,
  setLinkOpen,
}: {
  editor: TiptapEditor;
  onPickImage?: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  linkOpen: boolean;
  setLinkOpen: (v: boolean) => void;
}) {
  const mod = modKey();
  const inTable = editor.isActive("table");

  function addImageByUrl() {
    const url = window.prompt("Rasm URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="tiptap-toolbar">
      {/* Matn uslubi */}
      <Btn
        icon="bold"
        title="Qalin"
        shortcut={`${mod}+B`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      />
      <Btn
        icon="italic"
        title="Kursiv"
        shortcut={`${mod}+I`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      />
      <Btn
        icon="strike"
        title="Ustidan chizilgan"
        shortcut={`${mod}+Shift+X`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      />
      <Btn
        icon="code"
        title="Kod (satr ichida)"
        shortcut={`${mod}+E`}
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
      />

      <Btn
        icon="underline"
        title="Tagi chizilgan"
        shortcut={`${mod}+U`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      />
      <Btn
        icon="highlight"
        title="Ajratib belgilash"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
      />

      <Divider />

      {/* Sarlavhalar */}
      <Btn
        icon="h1"
        title="Sarlavha 1"
        shortcut={`${mod}+Alt+1`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      />
      <Btn
        icon="h2"
        title="Sarlavha 2"
        shortcut={`${mod}+Alt+2`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      />
      <Btn
        icon="h3"
        title="Sarlavha 3"
        shortcut={`${mod}+Alt+3`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      />

      <Divider />

      {/* Bloklar */}
      <Btn
        icon="bulletList"
        title="Belgili ro'yxat"
        shortcut={`${mod}+Shift+8`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      />
      <Btn
        icon="orderedList"
        title="Raqamli ro'yxat"
        shortcut={`${mod}+Shift+7`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      />
      <Btn
        icon="quote"
        title="Iqtibos"
        shortcut={`${mod}+Shift+B`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      />
      <Btn
        icon="code"
        label="blok"
        title="Kod bloki"
        shortcut={`${mod}+Alt+C`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
      />
      <Btn
        icon="rule"
        title="Ajratuvchi chiziq"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Divider />

      {/* Havola va rasm */}
      <div className="relative">
        <Btn
          icon="link"
          title="Havola"
          shortcut={`${mod}+K`}
          onClick={() => setLinkOpen(!linkOpen)}
          active={editor.isActive("link")}
        />
        {linkOpen && (
          <LinkPopover editor={editor} onClose={() => setLinkOpen(false)} />
        )}
      </div>
      <Btn
        icon="image"
        title={onPickImage ? "Media kutubxonadan rasm" : "Rasm (URL)"}
        onClick={() => (onPickImage ? onPickImage() : addImageByUrl())}
      />
      <Btn
        icon="video"
        title="YouTube video"
        onClick={() => {
          const url = window.prompt("YouTube havolasi:");
          if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }}
      />

      <Divider />

      {/* Tekislash */}
      <Btn
        icon="alignLeft"
        title="Chapga tekislash"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
      />
      <Btn
        icon="alignCenter"
        title="Markazga tekislash"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
      />

      <Divider />

      {/* Jadval: bo'sh joyni egallamasligi uchun faqat kerak bo'lganda kengayadi */}
      <Btn
        icon="table"
        title="Jadval qo'shish"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        active={inTable}
      />
      {inTable && (
        <>
          <Btn
            icon="rowPlus"
            title="Pastdan qator qo'shish"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <Btn
            icon="colPlus"
            title="O'ngdan ustun qo'shish"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <Btn
            icon="trash"
            title="Jadvalni o'chirish"
            onClick={() => editor.chain().focus().deleteTable().run()}
          />
        </>
      )}

      {/* O'ngdagi guruh */}
      <div className="ml-auto flex items-center gap-0.5">
        <Btn
          icon="undo"
          title="Orqaga"
          shortcut={`${mod}+Z`}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <Btn
          icon="redo"
          title="Oldinga"
          shortcut={`${mod}+Shift+Z`}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
        <Divider />
        <Btn
          icon={fullscreen ? "collapse" : "expand"}
          title={fullscreen ? "Oynadan chiqish (Esc)" : "To'liq ekran"}
          onClick={onToggleFullscreen}
          active={fullscreen}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- editor

export default function Editor({ value, onChange, onPickImage }: EditorProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // `editorProps` ichidagi ishlovchilar `editor` e'lon qilinishidan oldin
  // yoziladi, shuning uchun unga ref orqali murojaat qilinadi.
  const editorRef = useRef<TiptapEditor | null>(null);
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  const recalc = useCallback((ed: TiptapEditor) => {
    const text = ed.getText().trim();
    setStats({
      words: text ? text.split(/\s+/).length : 0,
      chars: text.length,
    });
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // SSR (Next.js) uchun muhim
    extensions: [
      StarterKit.configure({
        // Kod bloki lowlight versiyasi bilan almashtiriladi
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      ImageExt,
      Placeholder.configure({
        placeholder: "Matnni shu yerdan boshlang…",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ width: 840, height: 472, nocookie: true }),
      createSlashCommand({ onPickImage }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      recalc(editor);
    },
    onCreate: ({ editor }) => recalc(editor),
    editorProps: {
      attributes: { class: "tiptap-content" },

      // Skrinshotni Ctrl+V bilan qo'yish.
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (!images.length) return false;

        const ed = editorRef.current;
        if (!ed) return false;

        event.preventDefault();
        for (const file of images) {
          void uploadImage(ed, file, setUploading);
        }
        return true;
      },

      // Faylni muharrir ustiga sudrab tashlash.
      handleDrop: (_view, event) => {
        const files = Array.from(
          (event as DragEvent).dataTransfer?.files ?? []
        );
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (!images.length) return false;

        const ed = editorRef.current;
        if (!ed) return false;

        event.preventDefault();
        for (const file of images) {
          void uploadImage(ed, file, setUploading);
        }
        return true;
      },
      // Mod+K — havola oynasi. Tiptap'da bu birikma standart emas, shuning
      // uchun qo'lda ushlaymiz (toolbar ipucu shuni va'da qiladi).
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setLinkOpen(true);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Tashqaridan value o'zgarsa (tahrirlash sahifasi yuklanganda) sinxronlash
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
      recalc(editor);
    }
  }, [value, editor]);

  // Media kutubxonadan tanlangan rasmni qo'shish uchun tashqi API
  useEffect(() => {
    if (!editor) return;
    (
      window as unknown as { __insertImage?: (url: string) => void }
    ).__insertImage = (url: string) => {
      editor.chain().focus().setImage({ src: url }).run();
    };
  }, [editor]);

  // To'liq ekranda Esc bilan chiqish va sahifa aylanishini to'xtatish
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  if (!editor) {
    return (
      <div className="tiptap-shell flex items-center gap-2 px-5 py-10 text-sm text-ink-faint">
        <Icon name="spinner" className="h-4 w-4 animate-spin" />
        Muharrir yuklanmoqda…
      </div>
    );
  }

  const minutes = Math.max(1, Math.round(stats.words / 200));

  return (
    <div className={`tiptap-shell ${fullscreen ? "is-fullscreen" : ""}`}>
      <Toolbar
        editor={editor}
        onPickImage={onPickImage}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((v) => !v)}
        linkOpen={linkOpen}
        setLinkOpen={setLinkOpen}
      />

      {/* Matn belgilanganda chiqadigan tezkor menyu */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120 }}
        shouldShow={({ editor, from, to }) =>
          from !== to && !editor.isActive("codeBlock") && !editor.isActive("image")
        }
        className="flex items-center gap-0.5 rounded-lg border border-line bg-paper p-1 shadow-pop"
      >
        <Btn
          icon="bold"
          title="Qalin"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <Btn
          icon="italic"
          title="Kursiv"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <Btn
          icon="h2"
          title="Sarlavha 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        />
        <Btn
          icon="quote"
          title="Iqtibos"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />
        <Btn
          icon={editor.isActive("link") ? "unlink" : "link"}
          title={editor.isActive("link") ? "Havolani olib tashlash" : "Havola"}
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            const url = window.prompt("Havola manzili:");
            if (!url) return;
            const href = /^(https?:|mailto:|\/|#)/i.test(url)
              ? url
              : `https://${url}`;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
          active={editor.isActive("link")}
        />
      </BubbleMenu>

      <div className="tiptap-scroll">
        <EditorContent editor={editor} />
      </div>

      <div className="tiptap-status">
        <span>
          {stats.words} so'z · {stats.chars} belgi · ~{minutes} daqiqa o'qish
        </span>
        <span className="flex items-center gap-2">
          {uploading && (
            <span className="flex items-center gap-1.5 text-brand">
              <Icon name="spinner" className="h-3.5 w-3.5 animate-spin" />
              Rasm yuklanmoqda…
            </span>
          )}
          <span className="hidden sm:inline">
            {fullscreen ? "Chiqish uchun Esc" : "Blok qo'shish uchun /"}
          </span>
        </span>
      </div>
    </div>
  );
}
