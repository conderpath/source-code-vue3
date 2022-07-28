export const isObject = (value: unknown) => {
  return typeof value === "object" && value != null;
};

export const isArray = (value: unknown) => Array.isArray(value);

export const isFunction = (value: unknown) => typeof value === "function";
