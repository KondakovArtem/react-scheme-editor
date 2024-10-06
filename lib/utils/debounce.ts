export function debounce(func: (...args: any[]) => void, wait: number = 0) {
  let timeout: ReturnType<typeof setTimeout>;

  function debounced(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
