import {
  ServiceTemplateSetCategories,
  ServiceTemplateSetServices
} from '../../../../providers/stylist-service/stylist-models';

export interface ServicesItemForm {
  categories?: ServiceTemplateSetCategories[];
  categoryUuid?: string;
  service?: ServiceTemplateSetServices;
}
