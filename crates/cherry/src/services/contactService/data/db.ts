import { LocalDbAdapter } from '@/services/mock/LocalDbAdapter';
import { Contact } from '@/types';
import { Group } from '@/types/contact';

export type ContactDbData = {
  contacts: Contact[];
  groups: Group[];
};

export const contactDb = new LocalDbAdapter<ContactDbData>(
  'mock-contact-db',
  JSON.stringify,
  JSON.parse
);
export const defaultContactDb: ContactDbData = { contacts: [], groups: [] }; 