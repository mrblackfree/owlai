interface GtagEvent {
  action: string;
  category: string;
  label: string;
  value: number;
}

interface WindowWithGtag extends Window {
  dataLayer: any[];
  gtag(
    command: 'config',
    targetId: string,
    config?: {
      page_path?: string;
      page_title?: string;
      [key: string]: any;
    }
  ): void;
  gtag(
    command: 'event',
    eventName: string,
    eventParams?: {
      event_category?: string;
      event_label?: string;
      value?: number;
      [key: string]: any;
    }
  ): void;
  gtag(command: 'js', date: Date): void;
  gtag(command: 'set', config: { [key: string]: any }): void;
  gtag(command: string, ...args: any[]): void;
}

declare global {
  interface Window extends WindowWithGtag {}
} 