import React, { useEffect, useState } from "react";

type Props = {
  items: string[];
  intervalMs?: number;
};

const RotatingText: React.FC<Props> = ({ items, intervalMs = 1800 }) => {
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const step = () => {
      setEntering(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setEntering(true);
      }, 200); // quick out animation
    };
    const id = setInterval(step, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  return (
    <span
      className={`inline-block font-semibold text-[var(--sec)]`}
      style={{
        display: "inline-block",
        transform: entering ? "translateY(0) rotateX(0deg)" : "translateY(-20%) rotateX(-45deg)",
        opacity: entering ? 1 : 0,
        transition: "transform 200ms ease, opacity 200ms ease",
      }}
    >
      {items[index]}
    </span>
  );
};

export default RotatingText;

