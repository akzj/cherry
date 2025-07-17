

export interface DialogService {
  openImageDialog(): Promise<string | null>;
  openFileDialog(): Promise<string | null>;
}