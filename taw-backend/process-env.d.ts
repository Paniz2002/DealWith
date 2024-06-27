export{};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;
            JWT_SECRET: string;
            MONGODB_URI: string;
            // add more environment variables and their types here
        }
    }
}