import { init_All_Dom } from './core/dom-manager.js';
import { SiteManagement } from './SiteManagement.js';

try {
  const all_dom = init_All_Dom();
  new SiteManagement(all_dom);
} catch (error) {
}