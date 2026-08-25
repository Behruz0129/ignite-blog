/**
 * IKONKALAR
 * ---------
 * Emoji o'rniga bir xil qalinlikdagi chiziqli SVG'lar. Hammasi 24x24
 * koordinatada, `currentColor` bilan bo'yaladi — ya'ni matn rangiga ergashadi.
 *
 * Qo'shish: PATHS ga yangi nom va `d` qiymatini yozish kifoya.
 */

export type IconName =
  // navigatsiya
  | "dashboard"
  | "news"
  | "guide"
  | "opinion"
  | "users"
  | "folder"
  | "tag"
  | "comment"
  | "image"
  // interfeys
  | "search"
  | "menu"
  | "close"
  | "plus"
  | "pencil"
  | "trash"
  | "eye"
  | "eyeOff"
  | "external"
  | "logout"
  | "check"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "panel"
  | "alert"
  | "spinner"
  // muharrir
  | "bold"
  | "italic"
  | "strike"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "quote"
  | "code"
  | "link"
  | "unlink"
  | "table"
  | "rowPlus"
  | "colPlus"
  | "undo"
  | "redo"
  | "expand"
  | "collapse"
  | "rule";

// Ba'zi ikonkalar bir nechta chiziqdan iborat — shuning uchun qiymat massiv.
const PATHS: Record<IconName, string[]> = {
  dashboard: ["M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"],
  news: [
    "M4 5h12v14H5.5A1.5 1.5 0 0 1 4 17.5z",
    "M16 8h4v9.5a1.5 1.5 0 0 1-3 0V8",
    "M7 8.5h6M7 11.5h6M7 14.5h4",
  ],
  guide: [
    "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z",
    "M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z",
  ],
  opinion: ["M20 12a7 7 0 0 1-7 7H8l-4 3v-4.5A7 7 0 0 1 8 5h5a7 7 0 0 1 7 7z"],
  users: [
    "M15 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20",
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
    "M21 20v-1.5a4 4 0 0 0-3-3.87",
    "M15 4.13a3.5 3.5 0 0 1 0 6.74",
  ],
  folder: ["M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5z"],
  tag: [
    "M11.6 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.4a2 2 0 0 1-.59 1.42l-6.1 6.1a2 2 0 0 1-2.82 0l-6.4-6.4a2 2 0 0 1 0-2.83l6.1-6.1a2 2 0 0 1 1.41-.59z",
    "M16 8.5h.01",
  ],
  comment: [
    "M21 11.5a8 8 0 0 1-8.5 8L4 21l1.5-6A8 8 0 1 1 21 11.5z",
    "M8.8 12.2l2 2 4.4-4.4",
  ],
  image: [
    "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z",
    "M4 16l4.5-4.5 4 4 3-3L20 16",
    "M9 9.5h.01",
  ],

  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  close: ["M6 6l12 12M18 6L6 18"],
  plus: ["M12 5v14M5 12h14"],
  pencil: [
    "M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z",
    "M14.5 6.5l3 3",
  ],
  trash: [
    "M4 7h16",
    "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7",
    "M6.5 7l.8 11.6A1.5 1.5 0 0 0 8.8 20h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7",
  ],
  eye: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", "M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z"],
  eyeOff: [
    "M4 4l16 16",
    "M9.5 6.1A8.6 8.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a16 16 0 0 1-3.2 3.9",
    "M6.3 8.2A16 16 0 0 0 2.5 12S6 18.2 12 18.2a8.7 8.7 0 0 0 3.4-.66",
    "M9.9 10.1a2.8 2.8 0 0 0 3.9 3.9",
  ],
  external: ["M14 4h6v6", "M20 4l-8.5 8.5", "M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"],
  logout: ["M15 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H15", "M11 12h9", "M17 8.5l3.5 3.5L17 15.5"],
  check: ["M5 12.5l4.5 4.5L19 7"],
  chevronLeft: ["M14.5 5.5L8 12l6.5 6.5"],
  chevronRight: ["M9.5 5.5L16 12l-6.5 6.5"],
  chevronDown: ["M5.5 9.5L12 16l6.5-6.5"],
  panel: [
    "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z",
    "M10 4v16",
  ],
  alert: ["M12 8.5v5", "M12 16.6h.01", "M10.3 4.2 3.2 17a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"],
  spinner: ["M12 4.5v3", "M12 16.5v3", "M4.5 12h3", "M16.5 12h3", "M6.7 6.7l2.1 2.1", "M15.2 15.2l2.1 2.1", "M6.7 17.3l2.1-2.1", "M15.2 8.8l2.1-2.1"],

  bold: ["M7 5h6a3.5 3.5 0 0 1 0 7H7z", "M7 12h7a3.5 3.5 0 0 1 0 7H7z"],
  italic: ["M15 5h-5", "M14 19H9", "M14.5 5l-4 14"],
  strike: ["M4 12h16", "M8.5 8A3.2 3.2 0 0 1 11.8 5.4h1a3.1 3.1 0 0 1 3.2 2.4", "M15.8 16a3.3 3.3 0 0 1-3.4 2.7h-1A3.3 3.3 0 0 1 8 16.4"],
  h1: ["M4 6v12", "M11 6v12", "M4 12h7", "M15.5 9.5 18 8v10"],
  h2: ["M4 6v12", "M11 6v12", "M4 12h7", "M15 9.7a2.4 2.4 0 0 1 4.4 1.3c0 1.9-4.4 3.4-4.4 7h4.6"],
  h3: ["M4 6v12", "M11 6v12", "M4 12h7", "M15.2 9a2.3 2.3 0 0 1 4.2 1.2 2 2 0 0 1-2 2 2 2 0 0 1 2.1 2.1A2.4 2.4 0 0 1 15 15.6"],
  bulletList: ["M9 7h11", "M9 12h11", "M9 17h11", "M5 7h.01", "M5 12h.01", "M5 17h.01"],
  orderedList: ["M10 7h10", "M10 12h10", "M10 17h10", "M4 6.5 5.5 6v4", "M4 14.2a1.4 1.4 0 0 1 2.6.7c0 1.1-2.6 1.7-2.6 3.1h2.8"],
  quote: [
    "M9.5 6.5C7 7.6 5.5 9.8 5.5 12.4c0 2 1.2 3.4 3 3.4 1.6 0 2.8-1.2 2.8-2.8s-1.1-2.7-2.6-2.7c-.3 0-.6 0-.8.1.3-1.1 1.2-2 2.5-2.7z",
    "M18 6.5c-2.5 1.1-4 3.3-4 5.9 0 2 1.2 3.4 3 3.4 1.6 0 2.8-1.2 2.8-2.8s-1.1-2.7-2.6-2.7c-.3 0-.6 0-.8.1.3-1.1 1.2-2 2.5-2.7z",
  ],
  code: ["M9 8l-4.5 4L9 16", "M15 8l4.5 4L15 16"],
  link: ["M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1.4 1.4", "M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.5 3.5 0 0 0 5 5l1.4-1.4"],
  unlink: ["M4 4l16 16", "M10.5 13.5a3.5 3.5 0 0 0 4.2.6", "M13.5 10.5a3.5 3.5 0 0 0-4.2-.6", "M17 13l1-1a3.5 3.5 0 0 0-4.4-5.3", "M7 11l-1 1a3.5 3.5 0 0 0 4.4 5.3"],
  table: ["M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z", "M4 9.5h16", "M9.5 9.5V20", "M4 14.5h16"],
  rowPlus: ["M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V9H4z", "M12 13v6", "M9 16h6"],
  colPlus: ["M4 5.5A1.5 1.5 0 0 1 5.5 4H9v16H5.5A1.5 1.5 0 0 1 4 18.5z", "M15 9v6", "M12 12h6"],
  undo: ["M4 9h9.5a5 5 0 0 1 0 10H9", "M8 5 4 9l4 4"],
  redo: ["M20 9h-9.5a5 5 0 0 0 0 10H15", "M16 5l4 4-4 4"],
  expand: ["M4 9V4h5", "M20 9V4h-5", "M4 15v5h5", "M20 15v5h-5"],
  collapse: ["M9 4v5H4", "M15 4v5h5", "M9 20v-5H4", "M15 20v-5h5"],
  rule: ["M4 12h16"],
};

interface Props {
  name: IconName;
  className?: string;
  /** to'ldirilgan (fill) ko'rinish — masalan "bold" uchun */
  filled?: boolean;
}

export default function Icon({ name, className = "h-5 w-5", filled }: Props) {
  const paths = PATHS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={filled ? "currentColor" : "none"} />
      ))}
    </svg>
  );
}
