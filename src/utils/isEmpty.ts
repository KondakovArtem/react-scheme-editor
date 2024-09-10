export function isEmpty(value: any) {
  // Проверяем значение типа "null" или "undefined"
  if (value == null) return true;

  // Проверяем, является ли значение объектом
  if (typeof value === "object") {
    // Если объект массив, проверяем его длину
    if (Array.isArray(value)) return value.length === 0;

    // Если объект - объект, проверяем его количество собственных свойств
    return Object.keys(value).length === 0;
  }

  // Если значение - строка, проверяем её длину
  if (typeof value === "string") return value.length === 0;

  // Для других типов значений считаем их не пустыми
  return false;
}
