export interface ItemDetails {
  name: string;
  translatedName: string;
  fieldName?: string;
  value?: string;
  values?: string[];
  isInput: boolean;
  isCheckBox: boolean;
  isSelect: boolean;
  isChecked?: boolean;
  multiple?: boolean;
  id?: string;
}
