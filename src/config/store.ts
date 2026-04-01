import Conf from 'conf';

interface ConfigSchema {
  apiKey: string;
  baseUrl: string;
  defaultShell: 'powershell' | 'cmd' | 'bash' | '';  // 空字符串表示未设置，需要自动检测
  model: string;
  shellDetected: boolean;  // 是否已经自动检测并确认过
}

export const configStore = new Conf<ConfigSchema>({
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
