export enum CardType {
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Epic = 'Epic',
  Improvement = 'Improvement',
  Others = 'Others',
}

export namespace CardTypeSpace {
  export const getCardTypeValues = () => Object.values(CardType);
}
