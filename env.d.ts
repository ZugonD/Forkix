/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string
    readonly VITE_CLIENT_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare namespace NodeJS {
    interface ProcessEnv {
        VITE_SERVER_URL: string
        VITE_CLIENT_URL: string
    }
}