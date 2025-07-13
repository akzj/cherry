// UI组件相关类型定义

import { ID, Timestamp } from './core';

/**
 * 基础组件Props类型
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends BaseComponentProps {
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
}

/**
 * 输入框类型
 */
export interface InputProps extends BaseComponentProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * 模态框类型
 */
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  title?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * 加载状态类型
 */
export interface LoadingState {
  loading: boolean;
  error?: string;
  data?: any;
}

/**
 * 分页组件类型
 */
export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
}

/**
 * 表格列类型
 */
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
}

/**
 * 表格Props类型
 */
export interface TableProps<T = any> extends BaseComponentProps {
  dataSource: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps | false;
  rowKey?: string | ((record: T) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

/**
 * 表单字段类型
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    pattern?: RegExp;
    message?: string;
    min?: number;
    max?: number;
  };
}

/**
 * 表单Props类型
 */
export interface FormProps extends BaseComponentProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onReset?: () => void;
  submitText?: string;
  resetText?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
}

/**
 * 头像类型
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: number | 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

/**
 * 标签类型
 */
export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface TagProps extends BaseComponentProps {
  type?: TagType;
  closable?: boolean;
  onClose?: () => void;
}

/**
 * 菜单项类型
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  disabled?: boolean;
  danger?: boolean;
}

/**
 * 菜单Props类型
 */
export interface MenuProps extends BaseComponentProps {
  items: MenuItem[];
  selectedKeys?: string[];
  onSelect?: (selectedKeys: string[]) => void;
  mode?: 'horizontal' | 'vertical' | 'inline';
  theme?: 'light' | 'dark';
}

/**
 * 面包屑类型
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
  onClick?: () => void;
}

/**
 * 面包屑Props类型
 */
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

/**
 * 步骤类型
 */
export interface Step {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

/**
 * 步骤条Props类型
 */
export interface StepsProps extends BaseComponentProps {
  steps: Step[];
  current?: number;
  onChange?: (current: number) => void;
  direction?: 'horizontal' | 'vertical';
}

/**
 * 卡片类型
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
}

/**
 * 列表项类型
 */
export interface ListItem {
  id: ID;
  title: string;
  description?: string;
  avatar?: string;
  extra?: React.ReactNode;
  actions?: React.ReactNode[];
}

/**
 * 列表Props类型
 */
export interface ListProps extends BaseComponentProps {
  items: ListItem[];
  loading?: boolean;
  size?: 'small' | 'default' | 'large';
  bordered?: boolean;
  split?: boolean;
}

/**
 * 空状态类型
 */
export interface EmptyProps extends BaseComponentProps {
  image?: string | React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}

/**
 * 结果类型
 */
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

export interface ResultProps extends BaseComponentProps {
  status: ResultStatus;
  title: string;
  subTitle?: string;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * 进度条类型
 */
export interface ProgressProps extends BaseComponentProps {
  percent: number;
  status?: 'success' | 'exception' | 'active';
  strokeWidth?: number;
  showInfo?: boolean;
  format?: (percent: number) => string;
}

/**
 * 滑块类型
 */
export interface SliderProps extends BaseComponentProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
}

/**
 * 开关类型
 */
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (checked: boolean) => void;
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
}

/**
 * 评分类型
 */
export interface RateProps extends BaseComponentProps {
  value?: number;
  defaultValue?: number;
  count?: number;
  disabled?: boolean;
  allowHalf?: boolean;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
}

/**
 * 上传类型
 */
export interface UploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxCount?: number;
  fileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => void;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  customRequest?: (options: UploadRequestOption) => void;
}

export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  thumbUrl?: string;
  size?: number;
  type?: string;
  percent?: number;
  response?: any;
  error?: any;
}

export interface UploadRequestOption {
  file: File;
  filename: string;
  data?: Record<string, any>;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  onProgress?: (percent: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
} 