export function logSafe(obj: any, title = '', maxLength = 100) {
  const clone = JSON.parse(JSON.stringify(obj));

  function truncate(value: any) {
    if (typeof value === 'string' && value.length > maxLength) {
      return value.slice(0, maxLength) + `... (truncated ${value.length - maxLength} chars)`;
    }
    return value;
  }

  function walk(o: any) {
    Object.keys(o).forEach(key => {
      if (typeof o[key] === 'object' && o[key] !== null) {
        walk(o[key]);
      } else {
        o[key] = truncate(o[key]);
      }
    });
  }

  walk(clone);

  console.log(`${title} ${clone}`);
}