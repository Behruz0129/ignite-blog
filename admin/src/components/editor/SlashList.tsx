"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactElement,
} from "react";
import Icon, { type IconName } from "../Icon";

export interface SlashItem {
  title: string;
  hint: string;
  icon: IconName;
  /** Qidiruvda topilishi uchun qo'shimcha so'zlar (lotin/rus yozuvi). */
  keywords: string[];
  command: () => void;
}

export interface SlashListHandle {
  /** Tiptap klaviatura hodisalarini shu yerga uzatadi. */
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/**
 * `/` menyusi. Klaviatura bilan boshqariladi: ↑ ↓ tanlaydi, Enter qo'yadi,
 * Esc yopadi — sichqonchaga tegmasdan yozishda davom etish uchun.
 */
export const SlashList = forwardRef<SlashListHandle, { items: SlashItem[] }>(
  function SlashList({ items }, ref): ReactElement {
    const [selected, setSelected] = useState(0);

    // Ro'yxat qisqarganda tanlov chegaradan chiqib ketmasin.
    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        if (!items.length) return false;

        if (event.key === "ArrowUp") {
          setSelected((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          items[selected]?.command();
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="slash-menu px-3 py-2.5 text-[13px] text-ink-faint">
          Hech narsa topilmadi
        </div>
      );
    }

    return (
      <div className="slash-menu">
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => item.command()}
            onMouseEnter={() => setSelected(i)}
            className={`slash-item ${i === selected ? "is-active" : ""}`}
          >
            <span className="slash-item-icon">
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-ink">
                {item.title}
              </span>
              <span className="block truncate text-[12px] text-ink-faint">
                {item.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  }
);
