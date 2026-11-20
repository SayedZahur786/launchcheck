import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:90000,fullyParallel:false,workers:1,use:{baseURL:'http://localhost:3000',...devices['Desktop Chrome']},webServer:{command:'LOCAL_STORE=1 APP_URL=http://localhost:3000 npm run start',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:30000}});
