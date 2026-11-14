import { useRef } from "react";

export default function Tabs({ tabs, active, onChange, label = "Sections" }) {
  const listRef = useRef(null);

  function onKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === active);
    let next = null;

    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;

    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    const buttons = listRef.current?.querySelectorAll('[role="tab"]');
    buttons?.[next]?.focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`tab${selected ? " tab-active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {typeof tab.count === "number" ? <span className="tab-count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
