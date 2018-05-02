import { Services, ServiceTemplate, ServiceTemplateSet } from '../stylist-service/stylist-models';

export interface ServicesResponse {
  services: Services[];
}

export interface ServiceTemplatesResponse {
  service_templates: ServiceTemplate[];
}

export interface ServiceTemplateSetResponse {
  template_set: ServiceTemplateSet;
}
