export {};

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    title?: string;
    breadcrumb?: string;
  }
}
