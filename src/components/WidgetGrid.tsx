"use client";

import { useMemo } from "react";
import GridLayout, { type Layout, useContainerWidth } from "react-grid-layout";
import type { AppConfig, Widget, WidgetLayout } from "@/lib/schema";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";

function toRglLayout(layout: WidgetLayout[]): Layout {
  return layout.map((l) => ({
    i: l.i,
    x: l.x,
    y: l.y,
    w: l.w,
    h: l.h,
    minW: l.minW,
    minH: l.minH,
  }));
}

function toStoredLayout(layout: Layout): WidgetLayout[] {
  return layout.map((l) => ({
    i: String(l.i),
    x: l.x,
    y: l.y,
    w: l.w,
    h: l.h,
    minW: l.minW ?? undefined,
    minH: l.minH ?? undefined,
  }));
}

function renderWidget(
  widget: Widget,
  onEditWidget: (id: string) => void,
  onWeatherStatus?: (s: { state: "idle" | "loading" } | { state: "ready" } | { state: "error"; message: string }) => void
) {
  if (widget.type === "clock") {
    return <ClockWidget title={widget.title} timezone={widget.timezone} onEdit={() => onEditWidget(widget.id)} />;
  }

  if (widget.type === "weather") {
    return (
      <WeatherWidget
        title={widget.title}
        latitude={widget.latitude}
        longitude={widget.longitude}
        timezone={widget.timezone}
        unit={widget.unit}
        onEdit={() => onEditWidget(widget.id)}
        onStatus={onWeatherStatus}
      />
    );
  }
  return null;
}

export function WidgetGrid({
  config,
  onChangeLayout,
  onEditWidget,
  onWeatherStatus,
}: {
  config: AppConfig;
  onChangeLayout: (layout: WidgetLayout[]) => void;
  onEditWidget: (widgetId: string) => void;
  onWeatherStatus?: (s: { state: "idle" | "loading" } | { state: "ready" } | { state: "error"; message: string }) => void;
}) {
  const items = useMemo(
    () => config.widgets.items.filter((w) => w.type !== "status"),
    [config.widgets.items]
  );

  const itemIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const layout = useMemo(
    () => toRglLayout(config.widgets.layout.filter((l) => itemIds.has(l.i))),
    [config.widgets.layout, itemIds]
  );
  const { width, containerRef, mounted } = useContainerWidth();

  if (!config.widgets.enabled || items.length === 0) return null;

  return (
    <div ref={containerRef}>
      {mounted ? (
        <GridLayout
          className="layout"
          width={width}
          layout={layout}
          gridConfig={{
            cols: 12,
            rowHeight: 64,
            margin: [12, 12],
            containerPadding: [0, 0],
          }}
          dragConfig={{
            handle: "[data-drag-handle]",
          }}
          onLayoutChange={(next: Layout) => {
            onChangeLayout(toStoredLayout(next));
          }}
        >
          {items.map((w) => (
            <div key={w.id} className="group relative">
              <div
                data-drag-handle
                className="absolute right-2 top-2 z-10 select-none rounded-lg bg-black/30 px-2 py-1 text-[10px] text-white/70 opacity-0 transition group-hover:opacity-100"
                title="Drag"
              >
                Drag
              </div>
              {renderWidget(w, onEditWidget, onWeatherStatus)}
            </div>
          ))}
        </GridLayout>
      ) : null}
    </div>
  );
}
