import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
// Faqat tip kengaytmasi uchun: `setYoutubeVideo` buyrug'i shu moduldan keladi.
import "@tiptap/extension-youtube";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { SlashList, type SlashItem, type SlashListHandle } from "./SlashList";

export interface SlashActions {
  /** Media kutubxonani ochish (bo'lmasa "Rasm" bandi ko'rsatilmaydi). */
  onPickImage?: () => void;
}

/** `/` dan keyin yozilgan matnga qarab bandlarni filtrlaydi. */
function buildItems(
  { editor, range }: { editor: Editor; range: Range },
  actions: SlashActions
): SlashItem[] {
  // Har buyruq avval `/` matnini o'chiradi, keyin blokni qo'yadi.
  const run = (fn: () => void) => () => {
    editor.chain().focus().deleteRange(range).run();
    fn();
  };

  const items: SlashItem[] = [
    {
      title: "Sarlavha 1",
      hint: "Katta bo'lim sarlavhasi",
      icon: "h1",
      keywords: ["h1", "sarlavha", "zagolovok", "heading"],
      command: run(() => editor.chain().focus().setNode("heading", { level: 1 }).run()),
    },
    {
      title: "Sarlavha 2",
      hint: "Bo'lim sarlavhasi",
      icon: "h2",
      keywords: ["h2", "sarlavha", "zagolovok", "heading"],
      command: run(() => editor.chain().focus().setNode("heading", { level: 2 }).run()),
    },
    {
      title: "Sarlavha 3",
      hint: "Kichik sarlavha",
      icon: "h3",
      keywords: ["h3", "sarlavha", "heading"],
      command: run(() => editor.chain().focus().setNode("heading", { level: 3 }).run()),
    },
    {
      title: "Belgili ro'yxat",
      hint: "Nuqtali ro'yxat",
      icon: "bulletList",
      keywords: ["royxat", "list", "spisok", "punkt"],
      command: run(() => editor.chain().focus().toggleBulletList().run()),
    },
    {
      title: "Raqamli ro'yxat",
      hint: "1, 2, 3 tartibida",
      icon: "orderedList",
      keywords: ["royxat", "raqam", "list", "nomer"],
      command: run(() => editor.chain().focus().toggleOrderedList().run()),
    },
    {
      title: "Iqtibos",
      hint: "Ajratilgan matn bloki",
      icon: "quote",
      keywords: ["iqtibos", "citata", "quote", "blockquote"],
      command: run(() => editor.chain().focus().toggleBlockquote().run()),
    },
    {
      title: "Kod bloki",
      hint: "Sintaksis bo'yaladi",
      icon: "code",
      keywords: ["kod", "code", "programma"],
      command: run(() => editor.chain().focus().toggleCodeBlock().run()),
    },
    {
      title: "Jadval",
      hint: "3×3, sarlavha qatori bilan",
      icon: "table",
      keywords: ["jadval", "table", "tablica"],
      command: run(() =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      ),
    },
    {
      title: "YouTube video",
      hint: "Havolani qo'ying — video joylanadi",
      icon: "video",
      keywords: ["youtube", "video", "roilk", "trailer"],
      command: run(() => {
        const url = window.prompt("YouTube havolasi:");
        if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
      }),
    },
    {
      title: "Ajratuvchi chiziq",
      hint: "Bo'limlarni ajratadi",
      icon: "rule",
      keywords: ["chiziq", "line", "hr", "razdelitel"],
      command: run(() => editor.chain().focus().setHorizontalRule().run()),
    },
  ];

  if (actions.onPickImage) {
    items.splice(8, 0, {
      title: "Rasm",
      hint: "Media kutubxonadan tanlash",
      icon: "image",
      keywords: ["rasm", "image", "foto", "kartinka", "screenshot"],
      command: run(() => actions.onPickImage?.()),
    });
  }

  return items;
}

export function createSlashCommand(actions: SlashActions) {
  return Extension.create({
    name: "slashCommand",

    addOptions() {
      return {
        suggestion: {
          char: "/",
          // Faqat qator boshida — matn o'rtasidagi "/" (masalan URL) menyu ochmasin.
          startOfLine: true,
          command: ({ props }: { props: SlashItem }) => props.command(),
        },
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,

          items: ({ query, editor }: { query: string; editor: Editor }) => {
            const range = { from: 0, to: 0 } as Range;
            const all = buildItems({ editor, range }, actions);
            if (!query) return all;

            const q = query.toLowerCase();
            return all.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.keywords.some((k) => k.includes(q))
            );
          },

          render: () => {
            let component: ReactRenderer<SlashListHandle> | null = null;
            let popup: TippyInstance | null = null;

            return {
              onStart: (props) => {
                // `items` bosqichida haqiqiy `range` ma'lum emas edi, shuning
                // uchun buyruqlarni shu yerda qayta quramiz.
                const items = buildItems(
                  { editor: props.editor, range: props.range },
                  actions
                ).filter((item) => {
                  const q = props.query.toLowerCase();
                  return (
                    !q ||
                    item.title.toLowerCase().includes(q) ||
                    item.keywords.some((k) => k.includes(q))
                  );
                });

                component = new ReactRenderer(SlashList, {
                  props: { items },
                  editor: props.editor,
                });

                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },

              onUpdate: (props) => {
                const items = buildItems(
                  { editor: props.editor, range: props.range },
                  actions
                ).filter((item) => {
                  const q = props.query.toLowerCase();
                  return (
                    !q ||
                    item.title.toLowerCase().includes(q) ||
                    item.keywords.some((k) => k.includes(q))
                  );
                });

                component?.updateProps({ items });
                popup?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },

              onKeyDown: (props) => {
                if (props.event.key === "Escape") {
                  popup?.hide();
                  return true;
                }
                return component?.ref?.onKeyDown(props.event) ?? false;
              },

              onExit: () => {
                popup?.destroy();
                component?.destroy();
                popup = null;
                component = null;
              },
            };
          },
        }),
      ];
    },
  });
}
