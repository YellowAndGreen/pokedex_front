declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<void>;
      onUpdate: (callback: (data: any) => void) => void;
    };
  }
}
