import { Services, ServicesTemplate, ServiceTemplateSet } from '../stylist-service/stylist-models';

export interface ServicesResponse {
  services: Services[];
}

export interface ServiceTemplatesResponse {
  service_templates: ServicesTemplate[];
}

export interface ServiceTemplateSetResponse {
  template_set: ServiceTemplateSet;
}
