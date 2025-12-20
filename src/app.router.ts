//Como faço um router no react?
export const ROUTES = {
    LOGIN: "/login",
    HOME: "/home",
    DASHBOARD: "/",
    SETUP_ACCOUNT: "/setup",
    ADD_TRANSACTION: "/add-transaction",
} as const;

export type RouteKey = keyof typeof ROUTES;

