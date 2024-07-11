export enum CardStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Review = 'Review',
  Close = 'Close',
}

export namespace CardStatusSpace {
  export const getCardStatusValues = () => [CardStatus.Open, CardStatus.InProgress, CardStatus.Review, CardStatus.Close];
}
