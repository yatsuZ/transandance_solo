import { init_All_Dom } from './dom_gestion.js';
import { SiteManagement } from './SiteManagement.js';

// la classe qui gere tout
try {
  const all_dom = init_All_Dom();
  new SiteManagement(all_dom);
} catch (error) {
  console.error("[FAIL TO INIT CLASS] error = ", error);
}