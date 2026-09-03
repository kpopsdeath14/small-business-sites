/** "1290" → "1 290 ₽". Narrow no-break space so a price never wraps mid-number. */
export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU").replace(/ /g, " ")} ₽`;
}

/** Russian plural for a count: pluralize(3, ["товар", "товара", "товаров"]) → "товара". */
export function pluralize(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
