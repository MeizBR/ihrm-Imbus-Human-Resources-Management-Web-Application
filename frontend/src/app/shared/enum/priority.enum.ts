export enum CardPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export namespace PrioritySpace {
  export const getCardPriorityValues = () => Object.values(CardPriority);
}
