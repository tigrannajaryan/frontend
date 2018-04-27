import { Services, ServiceTemplate, ServiceTemplateSet } from '../stylist-service/stylist-models';

export interface Store {
  service_templates?: ServiceTemplate[];
  template_set?: ServiceTemplateSet;
  services?: Services[];
}
