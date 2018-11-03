import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse } from '~/shared/api/base.models';
import { ClientDetailsModel } from '~/core/api/clients-api.models';

/**
 * ClientDetailsApi allows getting details of the particular client of the stylist.
 */
@Injectable()
export class ClientDetailsApi extends BaseService {

    constructor(
        http: HttpClient,
        logger: Logger,
        serverStatus: ServerStatusTracker
    ) {
        super(http, logger, serverStatus);
    }

    /**
     * Get the client details of the stylist clients. The stylist must be already authenticated as a user.
     */
    getClientDetails(uuid: string): Observable<ApiResponse<ClientDetailsModel>> {
        return this.get<ClientDetailsModel>(`stylist/clients/${uuid}`);
    }
}
