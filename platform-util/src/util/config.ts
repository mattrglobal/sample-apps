export default () => ({
  MATTR_TENANT_SUBDOMAIN: process.env.MATTR_TENANT_SUBDOMAIN || '',
  MATTR_AUTH_TOKEN: process.env.MATTR_AUTH_TOKEN || '',
});
