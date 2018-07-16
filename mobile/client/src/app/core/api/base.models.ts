export interface ApiResponse<ReponseType> {
  response: ReponseType;
  errors?: ApiError[];
}
