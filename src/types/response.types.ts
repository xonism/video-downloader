import { type AxiosResponse } from 'axios';

type IFetchSuccess = { isSuccess: true; data: any; headers: AxiosResponse['headers'] };
type IFetchError = { isSuccess: false; error: string };
export type IFetchResult = IFetchSuccess | IFetchError;
