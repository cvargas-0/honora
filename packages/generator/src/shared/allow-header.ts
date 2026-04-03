const methodMap: Array<{ key: string; method: string; idRoute: boolean }> = [
  { key: "get",   method: "GET", idRoute: false },
  { key: "getId", method: "GET", idRoute: true  },
  { key: "post", method: "POST", idRoute: false },
  { key: "put", method: "PUT", idRoute: true },
  { key: "patch", method: "PATCH", idRoute: true },
  { key: "delete", method: "DELETE", idRoute: true },
  { key: "options", method: "OPTIONS", idRoute: false },
];

/**
 * Builds the value for an Allow header for either the collection root
 * route (isIdRoute=false) or the /:id route (isIdRoute=true).
 */
export function buildAllowHeader(
  methods: Set<string>,
  isIdRoute: boolean,
): string {
  return methodMap
    .filter((e) => methods.has(e.key) && e.idRoute === isIdRoute)
    .map((e) => e.method)
    .join(", ");
}
