import Conf from 'conf';
export const configStore = new Conf({
    projectName: 'nlc-cli',
    schema: {
        apiKey: {
            type: 'string',
            default: ''
        },
        baseUrl: {
            type: 'string',
            default: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
        },
        defaultShell: {
            type: 'string',
            default: ''
        },
        model: {
            type: 'string',
            default: 'qwen-turbo'
        },
        shellDetected: {
            type: 'boolean',
            default: false
        }
    }
});
