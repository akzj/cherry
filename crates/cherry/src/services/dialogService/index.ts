import { tauriDialogService } from './tauriImpl';
import { mockDialogService } from './mockImpl';
import { isTauriEnv } from '@/utils';


export const dialogService = isTauriEnv ? tauriDialogService : mockDialogService;
