export const MAX_FILE_SIZE_BYTES = 52428800; // 50MB
export const MAX_PREVIEW_ROWS = 100;
export const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.tsv'];
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  csv: ['text/csv', 'application/csv', 'text/plain'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  xls: ['application/vnd.ms-excel'],
  tsv: ['text/tab-separated-values', 'text/plain'],
};

export const EMPTY_VALUES = ['', 'null', 'NULL', 'undefined', 'N/A', 'n/a', 'NA', 'na', '-', '#N/A'];

export const COLUMN_TYPE_PATTERNS = {
  email: {
    exact: ['email', 'e-mail', 'mail', 'email_address', 'emailaddress', 'e_mail', 'correo'],
    partial: ['email', 'e-mail', 'e_mail'],
  },
  phone: {
    exact: ['phone', 'telephone', 'mobile', 'cell', 'tel', 'phone_number', 'phonenumber', 'contact_number', 'fax', 'mobile_number', 'cell_phone'],
    partial: ['phone', 'mobile', 'cell', 'telefon'],
  },
  name: {
    exact: ['name', 'full_name', 'fullname', 'full name', 'contact_name', 'person', 'contact', 'first_name', 'last_name', 'firstname', 'lastname'],
    partial: ['name'],
    exclude: ['filename', 'username', 'file_name', 'user_name', 'domain_name', 'hostname'],
  },
  domain: {
    exact: ['domain', 'website', 'url', 'web', 'site', 'company_domain', 'company_website', 'homepage', 'webpage'],
    partial: ['domain', 'website', 'webpage'],
  },
};

export const DEFAULT_TOAST_DURATION = 5000;
