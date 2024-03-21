export function debounce<T extends (...args: any[]) => any>(
  this: any,
  callback: T,
  delay: number
) {
  let timeoutId = 0;

  return (...args: Parameters<T>): ReturnType<T> => {
    let result: any;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      result = callback.apply(this, args);
    }, delay);
    return result;
  };
}

export function getRandomNumber(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
