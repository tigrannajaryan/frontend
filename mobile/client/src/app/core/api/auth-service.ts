import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/core/api/auth.models';

@Injectable()
export class AuthService extends BaseService {

  getCode(data: GetCodeParams): Observable<ApiResponse<GetCodeResponse>> {
    return this.post<GetCodeResponse>('auth/get-code', data);
  }

  confirmCode(data: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.post<ConfirmCodeResponse>('auth/code/confirm', data);
  }
}
