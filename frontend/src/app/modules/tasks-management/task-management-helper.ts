export function getNextId(data: Object[]): string {
  const cardCount: number =
    Math.max.apply(
      Math,
      data.map((obj: { [key: string]: string }) => parseInt(obj.Id.replace('Task ', ''), 10)),
    ) + 1;

  return 'Task ' + cardCount;
}
