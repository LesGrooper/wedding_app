export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
