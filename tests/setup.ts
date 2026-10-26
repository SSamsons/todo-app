import { createApp } from 'vue';
import { config } from '@vue/test-utils';
import { Dark, Meta, Notify, Quasar } from 'quasar';

const app = createApp({ template: '<div />' });
app.use(Quasar, { plugins: { Notify, Meta, Dark } });

config.global.plugins = [[Quasar, { plugins: { Notify, Meta, Dark } }]];
