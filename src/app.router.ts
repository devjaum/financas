//Como faço um router no react?
export const ROUTES = {
    LOGIN: "/login",
    HOME: "/home",
    DASHBOARD: "/"
} as const;

export type RouteKey = keyof typeof ROUTES;

