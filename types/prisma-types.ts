// Types to replace Prisma runtime types
export type Decimal = string | number;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
