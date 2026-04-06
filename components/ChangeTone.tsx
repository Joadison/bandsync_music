"use client";

import styles from "./ChangeTone.module.css";
import { AVAILABLE_KEYS } from "@/lib/utils";

interface ChangeToneProps {
  originalKey: string;
  selectedKey: string;
  onChange: (newKey: string) => void;
}

export function ChangeTone({
  originalKey,
  selectedKey,
  onChange,
}: ChangeToneProps) {
  if (!originalKey || originalKey === "---") return null;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>TOM</label>
      <select
        className={styles.select}
        value={selectedKey}
        onChange={(e) => onChange(e.target.value)}
      >
        {AVAILABLE_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      {selectedKey !== originalKey && (
        <span className={styles.original}>Original: {originalKey}</span>
      )}
    </div>
  );
}