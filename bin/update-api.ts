import { TravisClient } from '..';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
    try {
        const travis = new TravisClient();
        const endpoints = await travis.endpoints.get();

        if (endpoints && endpoints.length) {
            fs.writeFileSync(
                path.resolve(__dirname, '../api/v2.0.0/routes.json'),
                JSON.stringify(endpoints, null, 2),
                { encoding: 'utf8' }
            );
        }
    }

    catch (err) {
        console.error(err);
    }
})();
