export function parseCsv(text: string): string[][] {
  // very simple CSV (comma, no quotes-with-commas handling for v1)
  return text.trim().split(/\r?\n/).map(line => line.split(",").map(s => s.trim()))
}

export function rowsToObjects(rows: string[][]) {
  const [head, ...body] = rows
  return body.map(r => Object.fromEntries(head.map((h,i)=>[h, r[i] ?? ""])))
}