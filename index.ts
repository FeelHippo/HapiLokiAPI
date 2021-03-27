import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import * as fs from 'fs';
import Loki from 'lokijs';
import {
    loadCollection,
    fileFilter,
} from './utils.js';

// setup
const DB_NAME = 'db.json';
const COLLECTION_NAME = 'waivers';
const UPLOAD_PATH = 'uploads';
const fileOptions: FileUploaderOption = { dest: `${UPLOAD_PATH}/` };
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

// create folder for uload if it doesn't exist 
if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH);

const init = async () => {
    const server: Server = new Server({
        port: 3001,
        host: 'localhost',
        routes: { cors: true }
    });

    server.route({
        method: 'POST',
        path: '/newWaiver',
        options: {
            payload: {
                allow: 'multipart/form-data',
                parse: true,
                multipart: {
                    output: 'file'
                }
            },
        },
        handler: async (request: Request, h: ResponseToolkit) => {
            try {
                const data = request.payload;
                const file = data['waiver']; // must be implemented in-app
                const projectId = data['projectId'];
                const userId = data['userId'];
                
                // save file
                const { filename, headers, path, bytes } = file;
                fileFilter(filename);
                const fileDetails: FileDetails = {
                    filename,
                    mimetype: headers['content-type'],
                    destination: `${fileOptions.dest}`,
                    path,
                    bytes,
                    projectId,
                    userId,
                };

                // save data to db
                const col = await loadCollection(COLLECTION_NAME, db);
                const result = col.insert(fileDetails);
                db.saveDatabase();

                // return result
                return ({ id: result.$loki, fileName: result.filename, originalName: result.originalName });
            } catch (err) {
                return (Boom.badRequest(err.message, err));
            }
        }
    });

    // get all waivers for a project
    server.route({
        method: 'GET',
        path: '/allProjectWaivers/{projectId}',
        handler: async (request: Request, h: ResponseToolkit) => {
            try {
                const col = await loadCollection(COLLECTION_NAME, db);
                const waivers = col.data.filter(file => file.projectId === request.params.projectId);
                return (waivers);
            } catch (err) {
                return (Boom.badRequest(err.message, err));
            }
        }
    })

    // get user waiver
    server.route({
        method: 'GET',
        path: '/userWaiver/{userId}',
        handler: async (request: Request, h: ResponseToolkit) => {
            try {
                const col = await loadCollection(COLLECTION_NAME, db);
                const waiver = col.data.filter(file => file.userId === request.params.userId);
                return (waiver);
            } catch (err) {
                return (Boom.badRequest(err.message, err));
            }
        }
    })

    // start app
    await server.start();
    console.log(`Server started at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

init();
