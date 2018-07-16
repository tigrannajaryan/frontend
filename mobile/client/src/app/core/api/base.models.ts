import { ApiError } from '~/core/api/errors.models';

export interface ApiResponse<ReponseType> {
  response: ReponseType;
  errors?: ApiError[];
}
