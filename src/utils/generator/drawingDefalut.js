const DEFAULT_FORMID = 6;
const DEFAULT_SPAN = 24;
const MAX_LENGTH = 11;
export default [
  {
    layout: 'colFormItem',
    tagIcon: 'input',
    label: '手机号',
    vModel: 'mobile',
    formId: DEFAULT_FORMID,
    tag: 'el-input',
    placeholder: '请输入手机号',
    defaultValue: '',
    span: DEFAULT_SPAN,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': 'el-icon-mobile',
    'suffix-icon': '',
    maxlength: MAX_LENGTH,
    'show-word-limit': true,
    readonly: false,
    disabled: false,
    required: true,
    changeTag: true,
    regList: [{
      pattern: '/^1(3|4|5|7|8|9)\\d{9}$/',
      message: '手机号格式错误'
    }]
  }
];
