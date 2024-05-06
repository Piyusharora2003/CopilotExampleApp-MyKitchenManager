export enum Quantity {
  'Excess',
  'Good',
  'Low',
}

export interface foodItem {
  id: string;
  fname: string;
  dateOfExpiry?: Date;
  quantity?: string;
  icon?: string;
}