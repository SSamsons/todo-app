import { defineBoot } from '#q-app';
import { setupApp } from '@/main';

export default defineBoot(({ app }) => {
  setupApp(app);
});
