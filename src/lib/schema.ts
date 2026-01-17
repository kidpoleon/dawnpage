import { z } from "zod";

export const LinkOpenBehaviorSchema = z.enum(["new_tab", "same_tab"]);
export type LinkOpenBehavior = z.infer<typeof LinkOpenBehaviorSchema>;

export const IconSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("favicon"),
  }),
  z.object({
    type: z.literal("url"),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal("dashboardicons"),
    name: z.string().min(1),
  }),
]);
export type Icon = z.infer<typeof IconSchema>;

export const LinkItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  sectionId: z.string().min(1),
  sort: z.number().int().default(0),
  open: LinkOpenBehaviorSchema.default("new_tab"),
  icon: IconSchema.default({ type: "favicon" }),
});
export type LinkItem = z.infer<typeof LinkItemSchema>;

export const LinkSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sort: z.number().int().default(0),
});
export type LinkSection = z.infer<typeof LinkSectionSchema>;

export const ClockWidgetSchema = z.object({
  type: z.literal("clock"),
  id: z.string().min(1),
  title: z.string().default("Time"),
  timezone: z.string().default("local"),
});

export const WeatherWidgetSchema = z.object({
  type: z.literal("weather"),
  id: z.string().min(1),
  title: z.string().default("Weather"),
  latitude: z.number().min(-90).max(90).default(0),
  longitude: z.number().min(-180).max(180).default(0),
  timezone: z.string().default("auto"),
  unit: z.enum(["c", "f"]).default("c"),
});

export const StatusWidgetSchema = z.object({
  type: z.literal("status"),
  id: z.string().min(1),
  title: z.string().default("Status"),
  targets: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        url: z.string().url(),
      })
    )
    .default([]),
  intervalSeconds: z.number().int().min(10).max(3600).default(60),
});

export const WidgetSchema = z.discriminatedUnion("type", [
  ClockWidgetSchema,
  WeatherWidgetSchema,
  StatusWidgetSchema,
]);
export type Widget = z.infer<typeof WidgetSchema>;

export const WidgetLayoutSchema = z.object({
  i: z.string().min(1),
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int(),
  h: z.number().int(),
  minW: z.number().int().optional(),
  minH: z.number().int().optional(),
});
export type WidgetLayout = z.infer<typeof WidgetLayoutSchema>;

export const ThemeSchema = z.enum(["dark", "light"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const EffectsSchema = z.object({
  ambientCanvas: z.boolean().default(true),
  noise: z.boolean().default(true),
  cursorGlow: z.boolean().default(true),
});
export type Effects = z.infer<typeof EffectsSchema>;

export const AppConfigSchema = z.object({
  version: z.number().int().default(1),
  theme: ThemeSchema.default("dark"),
  search: z.object({
    engine: z.enum(["google"]).default("google"),
    showBangTooltips: z.boolean().default(true),
  }),
  wallpaper: z.object({
    enabled: z.boolean().default(true),
    source: z.enum(["bing"]).default("bing"),
    dim: z.number().min(0).max(1).default(0.55),
    blurPx: z.number().min(0).max(32).default(8),
  }),
  effects: EffectsSchema.default({ ambientCanvas: true, noise: true, cursorGlow: true }),
  links: z.object({
    sections: z.array(LinkSectionSchema).default([]),
    items: z.array(LinkItemSchema).default([]),
  }),
  widgets: z.object({
    enabled: z.boolean().default(true),
    items: z.array(WidgetSchema).default([]),
    layout: z.array(WidgetLayoutSchema).default([]),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function parseAppConfig(input: unknown): AppConfig {
  return AppConfigSchema.parse(input);
}
