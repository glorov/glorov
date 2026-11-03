/**
 * Class name combination utility for conditional Tailwind CSS classes.
 * Concatenates truthy string classes together, filtering out falsy values.
 *
 * @param classes - Class names, boolean conditionals, or undefined/null values.
 * @returns Combined class string.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
