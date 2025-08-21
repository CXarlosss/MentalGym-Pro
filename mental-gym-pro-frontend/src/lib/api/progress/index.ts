import { USE_MOCK } from '../config';
import * as Api from './progress.api';
import * as Local from './progress.local';

export const fetchUserProgress =
  USE_MOCK ? Local.fetchUserProgress : Api.fetchUserProgress;

