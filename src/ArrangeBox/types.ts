export interface InputItem {
  id: string;
  node: HTMLElement | string;
  name: string;
}

export interface ControlButton {
  id: string;
  listener(): void;
  icon?: string;
  text?: string;
}
