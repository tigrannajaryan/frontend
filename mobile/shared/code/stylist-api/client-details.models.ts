import { ISODateTime } from '~/shared/api/base.models';

export interface ClientDetailsModel {
    uuid: string;
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    state: string;
    photo: string;
    email: string;
    last_visit_datetime: ISODateTime;
    last_services_names: string[];
}
