//Como faço um router no react?
export const ROUTES = {
    DASHBOARD: "/",
} as const;

export type RouteKey = keyof typeof ROUTES;

