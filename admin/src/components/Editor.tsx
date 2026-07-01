"use client";

import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect } from "react";

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
  // Rasm qo'shish tugmasi bosilganda chaqiriladi (Media kutubxonadan tanlash uchun)
  onPickImage?: () => void;
}

// Toolbar tugmasi
function Btn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition ${
        active
          ? "bg-brand text-white"
          : "bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: TiptapEditor;
  onPickImage?: () => void;
}) {
  function addLink() {
    const url = window.prompt("Havola (URL):");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addImageByUrl() {
    const url = window.prompt("Rasm URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      <Btn title="Qalin" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <b>B</b>
      </Btn>
      <Btn title="Kursiv" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <i>I</i>
      </Btn>
      <Btn title="Tagiga chizilgan" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <s>S</s>
      </Btn>
      <span className="mx-1 w-px bg-slate-300" />
      <Btn title="Sarlavha 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
        H1
      </Btn>
      <Btn title="Sarlavha 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
        H2
      </Btn>
      <Btn title="Sarlavha 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
        H3
      </Btn>
      <span className="mx-1 w-px bg-slate-300" />
      <Btn title="Belgili ro'yxat" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        • List
      </Btn>
      <Btn title="Raqamli ro'yxat" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        1. List
      </Btn>
      <Btn title="Iqtibos" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        ❝
      </Btn>
      <Btn title="Kod bloki" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
        {"</>"}
      </Btn>
      <span className="mx-1 w-px bg-slate-300" />
      <Btn title="Havola" onClick={addLink} active={editor.isActive("link")}>
        🔗
      </Btn>
      <Btn title="Media kutubxonadan rasm" onClick={() => (onPickImage ? onPickImage() : addImageByUrl())}>
        🖼️
      </Btn>
      <Btn title="URL orqali rasm" onClick={addImageByUrl}>
        URL🖼️
      </Btn>
      <span className="mx-1 w-px bg-slate-300" />
      <Btn title="Jadval qo'shish" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        ▦ Jadval
      </Btn>
      <Btn title="Ustun qo'shish" onClick={() => editor.chain().focus().addColumnAfter().run()}>
        +Ustun
      </Btn>
      <Btn title="Qator qo'shish" onClick={() => editor.chain().focus().addRowAfter().run()}>
        +Qator
      </Btn>
      <Btn title="Jadvalni o'chirish" onClick={() => editor.chain().focus().deleteTable().run()}>
        ✕Jadval
      </Btn>
      <span className="mx-1 w-px bg-slate-300" />
      <Btn title="Orqaga" onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </Btn>
      <Btn title="Oldinga" onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </Btn>
    </div>
  );
}

export default function Editor({ value, onChange, onPickImage }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // SSR (Next.js) uchun muhim
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Kontentni shu yerga yozing..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[300px] px-4 py-3",
      },
    },
  });

  // Tashqaridan value o'zgarsa (masalan tahrirlash sahifasi yuklanganda) sinxronlash
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Media kutubxonadan tanlangan rasmni qo'shish uchun tashqi API
  useEffect(() => {
    if (!editor) return;
    (window as unknown as { __insertImage?: (url: string) => void }).__insertImage = (
      url: string
    ) => {
      editor.chain().focus().setImage({ src: url }).run();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 text-slate-400">
        Editor yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Toolbar editor={editor} onPickImage={onPickImage} />
      <EditorContent editor={editor} />
    </div>
  );
}
