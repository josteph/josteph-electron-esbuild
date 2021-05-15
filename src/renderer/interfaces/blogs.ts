export type Meta = { [key: string]: string };

export type Blog = {
  slug: string;
  meta: Meta;
  content: string;
};
