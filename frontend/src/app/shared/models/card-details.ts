export interface CardDetails {
  Id: string;
  Status: string;
  Project: string;
  Type: string;
  Title: string;
  Assignee: string;
  Priority: string;
  StoryPoints: number;
  Tags: string[];
  Summary: string;
}

export function mapToCardDetails(card: CardDetailsDTO): CardDetails {
  return {
    Id: card.Id,
    Status: card.Status,
    Project: card.Project,
    Type: card.Type,
    Title: card.Title,
    Assignee: card.Assignee,
    Priority: card.Priority,
    StoryPoints: card.StoryPoints,
    Tags: card.Tags,
    Summary: card.Summary,
  };
}

// NOTE: to be removed after backend implementation
export interface CardDetailsDTO {
  Id: string;
  Status: string;
  Project: string;
  Type: string;
  Title: string;
  Assignee: string;
  Priority: string;
  StoryPoints: number;
  Tags: string[];
  Summary: string;
}
