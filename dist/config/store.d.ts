import Conf from 'conf';
interface ConfigSchema {
    apiKey: string;
    baseUrl: string;
    defaultShell: 'powershell' | 'cmd' | 'bash' | '';
    model: string;
    shellDetected: boolean;
}
export declare const configStore: Conf<ConfigSchema>;
export {};
