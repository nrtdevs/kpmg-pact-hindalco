/// <reference types="vite/client" />

interface ImportMetaEnv {
    // more env variables...
    VITE_BASE_URL: String
    VITE_API_URL: String
    VITE_SSL: String
    VITE_COMPANY_LOGO: String
    VITE_CLIENT_LOGO: String
    VITE_ENCRYPTION_KEY: String
    VITE_IV: String
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
