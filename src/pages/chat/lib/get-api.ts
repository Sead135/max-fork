import { GreenAPI, type Credentials } from '../../../api';

export function getAPI(credentials?: Credentials | null) {
  if (!credentials) {
    return undefined;
  }

  return new GreenAPI(credentials);
}
